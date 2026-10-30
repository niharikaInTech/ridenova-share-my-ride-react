import { useState } from "react";

export default function ContactsBox({ contactsApi, riderName, onRiderNameChange }) {
  const { contacts, addContact, removeContact, toggleShared } = contactsApi;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function handleAdd() {
    const message = addContact(name.trim(), phone.trim());
    setError(message);
    if (message === "") {
      setName("");
      setPhone("");
    }
  }

  return (
    <details className="contactsBox" open>
      <summary>Trusted contacts ({contacts.length})</summary>

      <label htmlFor="riderName">Your name (used in messages)</label>
      <input
        type="text"
        id="riderName"
        value={riderName}
        maxLength={20}
        onChange={function (event) { onRiderNameChange(event.target.value); }}
      />

      {contacts.length === 0 && <p className="hint">No contacts yet. Add one below.</p>}

      {contacts.map(function (contact, index) {
        return (
          <div className="contactRow" key={contact.phone}>
            <input
              type="checkbox"
              checked={contact.shared}
              aria-label={"Share ride with " + contact.name}
              onChange={function () { toggleShared(index); }}
            />
            <span className="contactName">{contact.name}  {contact.phone}</span>
            <button type="button" className="linkBtn" onClick={function () { removeContact(index); }}>
              Remove
            </button>
          </div>
        );
      })}

      <div className="row">
        <input
          type="text"
          placeholder="Name"
          maxLength={20}
          value={name}
          onChange={function (event) { setName(event.target.value); }}
        />
        <input
          type="tel"
          placeholder="10-digit mobile"
          maxLength={10}
          value={phone}
          onChange={function (event) { setPhone(event.target.value); }}
        />
      </div>
      <p className="error">{error}</p>
      <button type="button" className="secondary" onClick={handleAdd}>Add contact</button>
    </details>
  );
}
