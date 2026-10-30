import { buildWhatsAppLink } from "../utils";

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
