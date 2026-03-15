import json
import os

DATA_FILE = "tournament_data.json"

# Default schema mimicking the original structure requirement
default_data = {
    "events": [
        {"id": 1, "name": "Event 1 - Sprint", "type": "Individual"},
        {"id": 2, "name": "Event 2 - Relay", "type": "Team"},
        {"id": 3, "name": "Event 3 - Long Jump", "type": "Individual"},
        {"id": 4, "name": "Event 4 - Tug of War", "type": "Team"},
        {"id": 5, "name": "Event 5 - Obstacle Run", "type": "Individual"}
    ],
    "participants": []
}

class DataManager:
    """Manages the JSON based database for the Tournament Scoring System."""
    
    def __init__(self, filename=DATA_FILE):
        self.filename = filename
        self.data = self.load_data()

    def load_data(self):
        if not os.path.exists(self.filename):
            self.save_data(default_data)
        try:
            with open(self.filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return default_data.copy()

    def save_data(self, data=None):
        if data is None:
            data = self.data
        with open(self.filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)

    def get_events(self):
        return self.data.get("events", [])
        
    def add_event(self, event):
        self.data.setdefault("events", []).append(event)
        self.save_data()

    def update_event(self, event_id: int, updated_event: dict):
        events = self.data.get("events", [])
        for i, ev in enumerate(events):
            if ev["id"] == event_id:
                events[i] = updated_event  # type: ignore # pyre-ignore
                self.save_data()
                return

    def delete_event(self, event_id: int):
        events = self.data.get("events", [])
        initial_count = len(events)
        self.data["events"] = [ev for ev in events if ev["id"] != event_id]  # type: ignore # pyre-ignore
        if len(self.data["events"]) < initial_count:
            self.save_data()

    def get_participants(self):
        return self.data.get("participants", [])

    def add_participant(self, participant):
        self.data.setdefault("participants", []).append(participant)
        self.save_data()

    def update_participant(self, idx: int, participant: dict):
        parts = self.data.get("participants", [])
        if 0 <= idx < len(parts):
            parts[idx] = participant  # type: ignore # pyre-ignore
            self.save_data()

    def delete_participant(self, idx: int):
        parts = self.data.get("participants", [])
        if 0 <= idx < len(parts):
            parts.pop(idx)
            self.save_data()
            
    def save_all(self):
        self.save_data()

# Global instances
db = DataManager()
