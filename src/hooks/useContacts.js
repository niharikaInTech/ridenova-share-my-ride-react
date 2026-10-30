// useContacts.js
// A custom hook: it keeps the trusted contacts list and saves it in the browser (localStorage).
// Each contact looks like: { name: "Mom", phone: "9876543210", shared: true }

import { useState, useEffect } from "react";
import { MAX_CONTACTS } from "../constants";
import { isValidPhone } from "../utils";

const STORAGE_KEY = "ridenovaContacts";

// Reads the saved contacts. If anything is wrong, we start with an empty list.
function loadContacts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

export default function useContacts() {
  // We pass the function itself (not its result) so it runs only once, at the start
  const [contacts, setContacts] = useState(loadContacts);

  // Every time the contacts change, save them
  useEffect(function () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (error) {
      // The app still works, contacts are just not remembered
    }
  }, [contacts]);

  // Returns an error message, or "" if the contact was added
  function addContact(name, phone) {
    if (name === "") {
      return "Please enter a name.";
    }
    if (!isValidPhone(phone)) {
      return "Enter a valid 10-digit mobile number.";
    }
    if (contacts.length >= MAX_CONTACTS) {
      return "You can add up to " + MAX_CONTACTS + " contacts.";
    }
    if (contacts.some(function (c) { return c.phone === phone; })) {
      return "This number is already added.";
    }

    // In React we never change the old array. We make a new one with the extra contact.
    setContacts([...contacts, { name, phone, shared: true }]);
    return "";
  }

  function removeContact(index) {
    setContacts(contacts.filter(function (c, i) { return i !== index; }));
  }

  // Tick or untick a contact
  function toggleShared(index) {
    setContacts(contacts.map(function (c, i) {
      return i === index ? { ...c, shared: !c.shared } : c;
    }));
  }

  return { contacts, addContact, removeContact, toggleShared };
}
