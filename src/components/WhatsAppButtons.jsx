// WhatsAppButtons.jsx
// One button per contact.
//
// IMPORTANT: a website cannot send WhatsApp messages by itself.
// That needs a server and the WhatsApp Business API.
// So each button opens WhatsApp with the message already typed, and the rider presses send.

import { buildWhatsAppLink } from "../utils";

// "getMessage" is a function. We call it when the button is CLICKED,
// so the message always has the latest location.
export default function WhatsAppButtons({ contacts, getMessage, label }) {
  if (contacts.length === 0) {
    return <p className="hint">No contacts selected for this ride.</p>;
  }

  return (
    <div>
      {contacts.map(function (contact) {
        return (
          <button
            type="button"
            className="waBtn"
            key={contact.phone}
            onClick={function () {
              window.open(buildWhatsAppLink(contact.phone, getMessage()), "_blank", "noopener");
            }}
          >
            {label} {contact.name} on WhatsApp
          </button>
        );
      })}
    </div>
  );
}
