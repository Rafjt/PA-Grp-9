import tkinter as tk
from tkinter import messagebox, simpledialog
import os
from dotenv import load_dotenv
import threading

import mysql.connector

load_dotenv()

conn = mysql.connector.connect(
    host=os.getenv("PCS_DB_HOST"),
    user=os.getenv("PCS_DB_USER"),
    password=os.getenv("PCS_DB_PASSWORD"),
    database=os.getenv("PCS_DB_NAME")
)
c = conn.cursor()

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
    if new_status == 1:
        comment = simpledialog.askstring("Commentaire", "Veuillez entrer un commentaire:")
        team = simpledialog.askstring("Equipe", "Veuillez entrer une équipe (infra, dev, front, legal, rh):")

        if not comment or not team:
            messagebox.showwarning("Input Error", "Both comment and team are required!")
            return

        query = "UPDATE signalement SET statut = %s, commentaire = %s, responsable = %s WHERE id = %s"
        c.execute(query, (new_status, comment, team, ticket_id))
    else:
        query = "UPDATE signalement SET statut = %s WHERE id = %s"
        c.execute(query, (new_status, ticket_id))
    
    conn.commit()
    print(f"Status updated for ticket {ticket_id}")
    refresh_data()

def update_comment(ticket_id):
    new_comment = simpledialog.askstring("Modifier le commentaire", "Veuillez entrer un nouveau commentaire:")

    if new_comment:
        query = "UPDATE signalement SET commentaire = %s WHERE id = %s"
        c.execute(query, (new_comment, ticket_id))
        conn.commit()
        print(f"Comment updated for ticket {ticket_id}")
        refresh_data()

def update_responsable(ticket_id):
    top = tk.Toplevel(root)
    top.title("Modifier le responsable")
    tk.Label(top, text="Sélectionner un responsable:").pack(pady=5)

    responsable_var = tk.StringVar()
    responsable_var.set("dev")

    options = ["dev-back", "dev-front","infra", "legal", "rh","support"]
    dropdown = tk.OptionMenu(top, responsable_var, *options)
    dropdown.pack(pady=5)

    def update():
        new_responsable = responsable_var.get()
        query = "UPDATE signalement SET responsable = %s WHERE id = %s"
        c.execute(query, (new_responsable, ticket_id))
        conn.commit()
        print(f"Responsable updated for ticket {ticket_id}")
        refresh_data()
        top.destroy()

    update_button = tk.Button(top, text="Update", command=update)
    update_button.pack(pady=10)

def create_cards():
    for frame in frames:
        for widget in frame.winfo_children():
            widget.destroy()

    status_titles = {
        0: "En attente",
        1: "En cours de traitement",
        2: "Résolu"
    }

    for index, frame in enumerate(frames):
        title_label = tk.Label(frame, text=status_titles[index], font=("Arial", 16, "bold"), bg="lightgrey", padx=10, pady=10)
        title_label.pack(fill='both')

        canvas = tk.Canvas(frame)
        scrollbar = tk.Scrollbar(frame, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas)

        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")

        for signalement in signalements:
            if signalement[5] != index:
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
                ("Statut", status_titles[signalement[5]], ("Arial", 12), fg_color),
                ("Nom", signalement[8], ("Arial", 12), fg_color),
                ("Prenom", signalement[9], ("Arial", 12), fg_color),
                ("Adresse Mail", signalement[10], ("Arial", 12), fg_color),
                ("Sujet", signalement[4], ("Arial", 12), fg_color),
                ("Commentaire", signalement[6], ("Arial", 12), fg_color),
                ("Responsable", signalement[7], ("Arial", 12), fg_color)
            ]
            for i, (text, value, font, color) in enumerate(labels):
                if value:
                    label = tk.Label(card, text=f"{text}: {value}", font=font or ("Arial", 12), fg=color or "black", bg=card['bg'], wraplength=300)
                    label.grid(row=i, column=0, sticky="w", padx=5, pady=2)

            if signalement[5] == 0:
                button = tk.Button(card, text="Traiter", command=lambda signalement=signalement: handle_button_click(signalement[0], 1), bg="#4CAF50", fg="black", padx=10, pady=5)
                button.grid(row=len(labels), column=0, sticky="we", padx=5, pady=5)
            elif signalement[5] == 1:
                button_resolve = tk.Button(card, text="Marquer comme résolu", command=lambda signalement=signalement: handle_button_click(signalement[0], 2), bg="#2196F3", fg="black", padx=10, pady=5)
                button_resolve.grid(row=len(labels), column=0, sticky="we", padx=5, pady=5)

                button_edit_comment = tk.Button(card, text="Modifier le commentaire", command=lambda signalement=signalement: update_comment(signalement[0]), bg="#FFC107", fg="black", padx=10, pady=5)
                button_edit_comment.grid(row=len(labels)+1, column=0, sticky="we", padx=5, pady=5)

                button_edit_responsable = tk.Button(card, text="Modifier le responsable", command=lambda signalement=signalement: update_responsable(signalement[0]), bg="#FFC107", fg="black", padx=10, pady=5)
                button_edit_responsable.grid(row=len(labels)+2, column=0, sticky="we", padx=5, pady=5)

    root.update_idletasks()

def refresh_data():
    global signalements
    signalements = fetch_signalement_data()
    update_display()

def update_display():
    create_cards()

root = tk.Tk()
root.title("Signalements")

root.geometry("1200x800")

title = tk.Label(root, text="Gestion des tickets utilisateurs", font=("Arial", 24, "bold"), pady=20)
title.pack()

frames = [tk.Frame(root, bd=1, relief="solid") for _ in range(3)]
frames.reverse()
for frame in frames:
    frame.pack(side='left', fill='both', expand=True, padx=10, pady=10)

signalements = fetch_signalement_data()
create_cards()

root.after(60000, refresh_data)

root.mainloop()
