import { useState, useEffect } from "react";
import { MAX_CONTACTS } from "../constants";
import { isValidPhone } from "../utils";

const STORAGE_KEY = "ridenovaContacts";

function loadContacts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

export default function useContacts() {
  const [contacts, setContacts] = useState(loadContacts);

  useEffect(function () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (error) {
    }
  }, [contacts]);

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

    setContacts([...contacts, { name, phone, shared: true }]);
    return "";
  }

  function removeContact(index) {
    setContacts(contacts.filter(function (c, i) { return i !== index; }));
  }

  function toggleShared(index) {
    setContacts(contacts.map(function (c, i) {
      return i === index ? { ...c, shared: !c.shared } : c;
    }));
  }

  return { contacts, addContact, removeContact, toggleShared };
}
