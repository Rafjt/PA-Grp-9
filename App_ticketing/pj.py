import tkinter as tk
from tkinter import messagebox
import mysql.connector
import os
from dotenv import load_dotenv
import threading

# Load environment variables from .env file
load_dotenv()

# Connect to the database
conn = mysql.connector.connect(
    host=os.getenv("PCS_DB_HOST"),
    user=os.getenv("PCS_DB_USER"),
    password=os.getenv("PCS_DB_PASSWORD"),
    database=os.getenv("PCS_DB_NAME")
)
c = conn.cursor()

# Function to fetch signalement and user data
def fetch_signalement_data():
    query = '''
        SELECT s.*, COALESCE(cb.nom, v.nom, p.nom), COALESCE(cb.prenom, v.prenom, p.prenom), COALESCE(cb.adresseMail, v.adresseMail, p.adresseMail)
        FROM signalement s 
        LEFT JOIN clientsBailleurs cb ON s.id_ClientBailleur = cb.id
        LEFT JOIN voyageurs v ON s.id_Voyageur = v.id
        LEFT JOIN prestataires p ON s.id_Prestataire = p.id;
    '''
    c.execute(query)
    return c.fetchall()

def handle_button_click(ticket_id, new_status):
    # Update the status of the signalement in the database
    query = "UPDATE signalement SET statut = %s WHERE id = %s"
    c.execute(query, (new_status, ticket_id))
    conn.commit()
    print(f"Status updated for ticket {ticket_id}")
    refresh_data()  # Refresh data immediately after button click

def create_cards():
    # Clear existing frames
    for frame in frames:
        for widget in frame.winfo_children():
            widget.destroy()

    # Map status codes to titles
    status_titles = {
        0: "En attente",
        1: "En cours de traitement",
        2: "Résolu"
    }

    for index, frame in enumerate(frames):
        # Create a title label for each frame
        title_label = tk.Label(frame, text=status_titles[index], font=("Arial", 16, "bold"), bg="lightgrey", padx=10, pady=10)
        title_label.pack(fill='both')

        # Create a canvas widget and a vertical scrollbar for scrolling up and down
        canvas = tk.Canvas(frame)
        scrollbar = tk.Scrollbar(frame, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas)

        # Configure the canvas to have a scrollbar
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Add the scrollable frame to the canvas
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")

        for signalement in signalements:
            if signalement[5] != index:  # Skip if the signalement does not belong to this frame
                continue

            bg_color = "white" if signalement[5] == 0 else "lightgrey" if signalement[5] == 1 else "#333333"
            fg_color = "black" if signalement[5] != 2 else "white"
            card = tk.Frame(scrollable_frame, bd=1, relief="solid", bg=bg_color)
            card.pack(fill='both', expand=True, padx=10, pady=10)

            labels = [
                ("ID du ticket", signalement[0], ("Arial", 12), fg_color),
                ("Client Bailleur ID", signalement[1], ("Arial", 12), fg_color),
                ("Voyageur ID", signalement[2], ("Arial", 12), fg_color),
                ("Prestataire ID", signalement[3], ("Arial", 12), fg_color),
                ("Statut", status_titles[signalement[5]], ("Arial", 12), fg_color),  # Use the status title instead of the status code
                ("Nom", signalement[6], ("Arial", 12), fg_color),
                ("Prenom", signalement[7], ("Arial", 12), fg_color),
                ("Adresse Mail", signalement[8], ("Arial", 12), fg_color),
                ("Sujet\n", signalement[4], ("Arial", 12), fg_color),
            ]
            for i, (text, value, font, color) in enumerate(labels):
                if value:  # Only create label if value is not None or not an empty string
                    label = tk.Label(card, text=f"{text}: {value}", font=font or ("Arial", 12), fg=color or "black", bg=card['bg'], wraplength=300)
                    label.grid(row=i, column=0, sticky="w", padx=5, pady=2)

            # Add a button based on the status of the signalement
            if signalement[5] == 0:
                button = tk.Button(card, text="Traiter", command=lambda signalement=signalement: handle_button_click(signalement[0], 1), bg="#4CAF50", fg="black", padx=10, pady=5)
                button.grid(row=len(labels), column=0, sticky="w", padx=5, pady=5)
            elif signalement[5] == 1:
                button = tk.Button(card, text="Marquer comme résolu", command=lambda signalement=signalement: handle_button_click(signalement[0], 2), bg="#2196F3", fg="black", padx=10, pady=5)
                button.grid(row=len(labels), column=0, sticky="w", padx=5, pady=5)

            card.pack(pady=5)

        # Configure the scrollable frame to change its view when the canvas is scrolled
        scrollable_frame.update()  # Update the scrollable frame to get the correct size
        canvas.configure(scrollregion=(0, 0, 0, scrollable_frame.winfo_height()))  # Set the scrollregion to the height of the scrollable frame

def refresh_data():
    global signalements
    signalements = fetch_signalement_data()
    update_display()

def update_display():
    create_cards()

# User interface
root = tk.Tk()
root.title("Signalements")

# Set window size
root.geometry("1200x800")

# Create title label
title = tk.Label(root, text="Gestion des tickets utilisateurs", font=("Arial", 24, "bold"), pady=20)
title.pack()

frames = [tk.Frame(root, bd=1, relief="solid") for _ in range(3)]
frames.reverse()  # Reverse the order of frames
for frame in frames:
    frame.pack(side='left', fill='both', expand=True, padx=10, pady=10)

signalements = fetch_signalement_data()
create_cards()

# Start the polling to refresh data every 1 minute
root.after(60000, refresh_data)

root.mainloop()
