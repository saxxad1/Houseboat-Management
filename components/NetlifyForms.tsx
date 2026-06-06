export default function NetlifyForms() {
  return (
    <div className="hidden" aria-hidden="true">
      <form name="booking-request" data-netlify="true" netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="booking-request" />
        <input name="bot-field" />
        <input name="name" />
        <input name="phone" />
        <input name="email" />
        <input name="checkin" />
        <input name="checkout" />
        <input name="guests" />
        <input name="bookingType" />
        <input name="cabin" />
        <input name="payment" />
        <input name="season_type" />
        <input name="eventDate" />
        <input name="eventType" />
        <input name="eventSlot" />
        <input name="guestRange" />
        <input name="foodPlan" />
        <input name="decorationRequired" />
        <input name="soundSystemRequired" />
        <textarea name="request" />
      </form>

      <form name="contact-message" data-netlify="true" netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="contact-message" />
        <input name="bot-field" />
        <input name="name" />
        <input name="phone" />
        <textarea name="message" />
      </form>
    </div>
  );
}
