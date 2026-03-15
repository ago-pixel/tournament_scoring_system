import flet as ft  # type: ignore # pyre-ignore[21]
import os
import sys

# Ensure the script directory is in sys.path for mobile builds
script_dir = os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.insert(0, script_dir)

from core.data import db  # type: ignore # pyre-ignore[21]
from core.logic import calculate_rankings  # type: ignore # pyre-ignore[21]
from core.auth import auth_manager  # type: ignore # pyre-ignore[21]

# --- Config ---
PRIMARY_COLOR = "#7B1010"  # Cambridge Academy Red
SECONDARY_COLOR = "#FFD700" # Gold for 1st place

def main(page: ft.Page):
    page.title = "Cambridge Academy - Scoring System"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.padding = 0
    page.window_width = 400
    page.window_height = 800

    # --- State ---
    current_user_role = "public" # public or admin

    # --- Components ---
    
    def logout(e):
        nonlocal current_user_role
        current_user_role = "public"
        show_public_view()

    def show_public_view():
        page.clean()
        page.appbar = ft.AppBar(
            leading=ft.Image(src="assets/logo.png", width=40, height=40, fit=ft.BoxFit.CONTAIN),
            title=ft.Text("CAE Results", color=ft.Colors.WHITE),
            bgcolor=PRIMARY_COLOR,
            actions=[
                ft.IconButton(ft.Icons.ADMIN_PANEL_SETTINGS, on_click=lambda _: (print("Admin icon clicked"), show_login_dialog()), icon_color=ft.Colors.WHITE)
            ]
        )
        
        results = calculate_rankings()
        
        lv = ft.ListView(expand=1, spacing=10, padding=20)
        
        for p in results:
            rank = p.get("rank", 0)
            medal = "🥇" if rank == 1 else "🥈" if rank == 2 else "🥉" if rank == 3 else f"{rank}."
            
            lv.controls.append(
                ft.Container(
                    content=ft.Row([
                        ft.Text(medal, size=20, weight=ft.FontWeight.BOLD, width=40),
                        ft.Column([
                            ft.Text(p["name"], size=16, weight=ft.FontWeight.BOLD),
                            ft.Text(p.get("team") or p.get("type", "Individual"), color=ft.Colors.GREY_700, size=12),
                        ], expand=True),
                        ft.Text(f"{p['total']} pts", weight=ft.FontWeight.BOLD, color=PRIMARY_COLOR)
                    ]),
                    padding=15,
                    border_radius=10,
                    bgcolor=ft.Colors.WHITE,
                    shadow=ft.BoxShadow(spread_radius=1, blur_radius=5, color=ft.Colors.BLACK12),
                    border=ft.border.all(2, SECONDARY_COLOR if rank == 1 else ft.Colors.TRANSPARENT)
                )
            )
        
        page.add(lv)
        page.update()

    def show_login_dialog():
        password_input = ft.TextField(label="Admin Password", password=True, can_reveal_password=True)
        
        def handle_login(e):
            if auth_manager.login(password_input.value):
                nonlocal current_user_role
                current_user_role = "admin"
                dialog.open = False
                show_admin_view()
            else:
                password_input.error_text = "Incorrect password"
                page.update()

        dialog = ft.AlertDialog(
            title=ft.Text("Admin Login"),
            content=password_input,
            actions=[
                ft.TextButton("Cancel", on_click=lambda _: setattr(dialog, "open", False) or page.update()),
                ft.ElevatedButton("Login", on_click=handle_login, bgcolor=PRIMARY_COLOR, color=ft.Colors.WHITE),
            ],
        )
        if not hasattr(page, "overlay"):
            page.overlay = []
        page.overlay.append(dialog)
        dialog.open = True
        page.update()

    def show_admin_view():
        page.clean()
        page.appbar = ft.AppBar(
            title=ft.Text("Admin Dashboard", color=ft.Colors.WHITE),
            bgcolor=PRIMARY_COLOR,
            actions=[
                ft.IconButton(ft.Icons.LOGOUT, on_click=logout, icon_color=ft.Colors.WHITE)
            ]
        )

        tabs = ft.Tabs(
            selected_index=0,
            animation_duration=300,
            expand=1,
            content=ft.TabBarView(
                controls=[
                    get_participant_manager(),
                    get_event_manager(),
                ]
            )
        )
        tabs.tabs = [
            ft.Tab(label="Participants", icon=ft.Icons.PERSON),
            ft.Tab(label="Events", icon=ft.Icons.EVENT),
        ]
        
        page.add(tabs)
        page.update()

    def get_participant_manager():
        plist = ft.ListView(expand=True, spacing=10, padding=10)
        
        def refresh_plist():
            plist.controls.clear()
            for i, p in enumerate(db.get_participants()):
                plist.controls.append(
                    ft.ListTile(
                        leading=ft.Icon(ft.Icons.PERSON if p["type"] == "Individual" else ft.Icons.GROUP),
                        title=ft.Text(p["name"]),
                        subtitle=ft.Text(p.get("team") or p["type"]),
                        trailing=ft.Row([
                            ft.IconButton(ft.Icons.EDIT, on_click=lambda _, idx=i: edit_p_dialog(idx)),
                            ft.IconButton(ft.Icons.DELETE, icon_color=ft.Colors.RED, on_click=lambda _, idx=i: delete_p(idx)),
                        ], tight=True),
                    )
                )
            page.update()

        def add_p(e):
            # Simplified add - in a real app would use a dialog
            show_add_p_dialog()

        # ... logic for add/edit/delete ...
        refresh_plist()
        return ft.Column([
            ft.ElevatedButton("Add Participant", icon=ft.Icons.ADD, on_click=add_p, color=PRIMARY_COLOR),
            plist
        ])

    def get_event_manager():
        elist = ft.ListView(expand=True, spacing=10, padding=10)
        
        def refresh_elist():
            elist.controls.clear()
            for i, ev in enumerate(db.get_events()):
                elist.controls.append(
                    ft.ListTile(
                        leading=ft.Icon(ft.Icons.EMOJI_EVENTS, color=SECONDARY_COLOR),
                        title=ft.Text(ev["name"]),
                        subtitle=ft.Text(ev["type"]),
                        trailing=ft.Row([
                            ft.IconButton(ft.Icons.LIST_ALT, tooltip="Record Scores", on_click=lambda _, e_id=ev["id"], e_idx=i: show_score_recorder(e_id, e_idx)),
                            ft.IconButton(ft.Icons.DELETE, icon_color=ft.Colors.RED, on_click=lambda _, e_id=ev["id"]: delete_ev(e_id)),
                        ], tight=True),
                    )
                )
            page.update()

        def add_ev_dialog(e):
            name_in = ft.TextField(label="Event Name")
            type_in = ft.Dropdown(options=[ft.dropdown.Option("Individual"), ft.dropdown.Option("Team")], value="Individual")
            
            def save_ev(e):
                if not name_in.value: return
                events = db.get_events()
                new_id = (max(ev["id"] for ev in events) + 1) if events else 1
                db.add_event({"id": new_id, "name": name_in.value, "type": type_in.value})
                # Add score slot
                for p in db.get_participants():
                    if "scores" not in p: p["scores"] = []
                    p["scores"].append(None)
                db.save_all()
                add_dialog.open = False
                show_admin_view()

            add_dialog = ft.AlertDialog(title=ft.Text("Add Event"), content=ft.Column([name_in, type_in], tight=True), actions=[ft.TextButton("Save", on_click=save_ev)])
            if not hasattr(page, "overlay"):
                page.overlay = []
            page.overlay.append(add_dialog)
            add_dialog.open = True
            page.update()

        def delete_ev(e_id):
            # Same logic as Desktop for index removal
            events = db.get_events()
            e_idx = -1
            for i, ev in enumerate(events):
                if ev["id"] == e_id:
                    e_idx = i; break
            if e_idx != -1:
                db.delete_event(e_id)
                for p in db.get_participants():
                    if "scores" in p and len(p["scores"]) > e_idx:
                        p["scores"].pop(e_idx)
                db.save_all()
            show_admin_view()

        refresh_elist()
        return ft.Column([
            ft.ElevatedButton("Add Event", icon=ft.Icons.ADD, on_click=add_ev_dialog, color=PRIMARY_COLOR),
            elist
        ])

    def show_score_recorder(event_id, event_idx):
        page.clean()
        page.appbar = ft.AppBar(title=ft.Text("Record Scores", color=ft.Colors.WHITE), bgcolor=PRIMARY_COLOR, leading=ft.IconButton(ft.Icons.ARROW_BACK, on_click=lambda _: show_admin_view(), icon_color=ft.Colors.WHITE))
        
        plist = ft.ListView(expand=True, spacing=10, padding=10)
        participants = db.get_participants()
        
        inputs = []
        for i, p in enumerate(participants):
            score_val = str(p["scores"][event_idx]) if p.get("scores") and p["scores"][event_idx] is not None else ""
            score_in = ft.TextField(label=p["name"], value=score_val, keyboard_type=ft.KeyboardType.NUMBER, width=100)
            inputs.append((i, score_in))
            plist.controls.append(ft.Row([ft.Text(p["name"], expand=True), score_in], alignment=ft.MainAxisAlignment.SPACE_BETWEEN))

        def save_scores(e):
            for i, score_in in inputs:
                val = score_in.value.strip()
                participants[i]["scores"][event_idx] = int(val) if val.isdigit() else None
            db.save_all()
            show_admin_view()

        page.add(plist, ft.FloatingActionButton(icon=ft.Icons.SAVE, on_click=save_scores, bgcolor=PRIMARY_COLOR, content=ft.Icon(ft.Icons.SAVE, color=ft.Colors.WHITE)))
        page.update()

    # --- Dialogs & Helpers ---
    def show_add_p_dialog():
        name_in = ft.TextField(label="Name")
        type_in = ft.Dropdown(options=[ft.dropdown.Option("Individual"), ft.dropdown.Option("Team")], value="Individual")
        team_in = ft.TextField(label="Team Name (if Team)", visible=False)
        
        def toggle_team(e):
            team_in.visible = type_in.value == "Team"
            page.update()
        
        type_in.on_change = toggle_team

        def save_new(e):
            if not name_in.value: return
            new_p = {"name": name_in.value, "type": type_in.value, "team": team_in.value if type_in.value == "Team" else None, "scores": [None]*len(db.get_events())}
            db.add_participant(new_p)
            add_dialog.open = False
            show_admin_view() # Refresh

        add_dialog = ft.AlertDialog(
            title=ft.Text("Add Participant"),
            content=ft.Column([name_in, type_in, team_in], tight=True),
            actions=[ft.TextButton("Save", on_click=save_new)]
        )
        page.open(add_dialog)

    def delete_p(idx):
        db.delete_participant(idx)
        show_admin_view()

    def edit_p_dialog(idx):
        p = db.get_participants()[idx]
        name_in = ft.TextField(label="Name", value=p["name"])
        def save_edit(e):
            p["name"] = name_in.value
            db.update_participant(idx, p)
            edit_dialog.open = False
            show_admin_view()
        
        edit_dialog = ft.AlertDialog(title=ft.Text("Edit"), content=name_in, actions=[ft.TextButton("Update", on_click=save_edit)])
        if not hasattr(page, "overlay"):
            page.overlay = []
        page.overlay.append(edit_dialog)
        edit_dialog.open = True
        page.update()

    # Initial View
    show_public_view()

if __name__ == "__main__":
    # Ensure relative imports work for logic/data if needed, or just adjust sys.path
    # For simplicity, we assume this is run from mobile_version/
    ft.run(main, assets_dir="assets")
