class AuthManager:
    """Manages simple authentication state for the admin."""
    def __init__(self, password="admin"):
        # Very simple authentication for this system (mocked)
        self._password = password
        self.is_admin = False

    def login(self, pwd):
        if pwd == self._password:
            self.is_admin = True
            return True
        return False

    def logout(self):
        self.is_admin = False

# Global instance
auth_manager = AuthManager()
