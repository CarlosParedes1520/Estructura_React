type Listener = () => void;

class ProfileUpdater {
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  dispatch() {
    console.log("[ProfileEvent] Despachando actualización de perfil...");
    this.listeners.forEach((listener) => listener());
  }
}

export const profileUpdater = new ProfileUpdater();
