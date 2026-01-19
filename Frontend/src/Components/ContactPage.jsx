import React, { useState } from "react";
import { contactStyles } from "../assets/dummyStyles";
import { ToastContainer } from "react-toastify";
import { MessageCircle, Send, Ticket } from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Only allow digits for phone and limit to 10 chars
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digits }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate phone is exactly 10 digits
    if (!formData.phone || formData.phone.length !== 10) {
      toast.error("⚠️ Please enter a valid 10-digit phone number.");
      console.warn("Submit blocked - invalid phone:", formData.phone);
      return;
    }

    // Format the message for WhatsApp
    const whatsappMessage = `Name: ${encodeURIComponent(
      formData.name
    )}%0AEmail: ${encodeURIComponent(
      formData.email
    )}%0APhone: ${encodeURIComponent(
      formData.phone
    )}%0ASubject: ${encodeURIComponent(
      formData.subject
    )}%0AMessage: ${encodeURIComponent(formData.message)}`;

    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/9876543210?text=${whatsappMessage}`, "_blank");
    
    // Reset form after submission
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className={contactStyles.pageContainer}>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className={contactStyles.bgGradient}></div>
      <div className={contactStyles.bgBlob1}></div>
      <div className={contactStyles.bgBlob2}></div>

      {/* side effects for film */}
      <div className={contactStyles.filmStripTop}>
        {[...Array(20)].map((_, i) => (
          <div key={i} className={contactStyles.filmStripSegment}></div>
        ))}
      </div>
      <div className={contactStyles.filmStripBottom}>
        {[...Array(20)].map((_, i) => (
          <div key={i} className={contactStyles.filmStripSegment}></div>
        ))}
      </div>

      <div className={contactStyles.contentContainer}>
        <div className={contactStyles.headerContainer}>
          <div className="inline-flex items-center justify-center mb-4">
            <h1 className={contactStyles.headerTitle}>
              <span className={contactStyles.headerTitleRed}> Contact</span>
              <span className={contactStyles.headerTitleWhite}> Us</span>
            </h1>
          </div>
          <p className={contactStyles.headerSubtitle}>
            Have questions about movie bookings or sopecial events? Our team is
            here to help you.
          </p>
        </div>

        <div className={contactStyles.gridContainer}>
          {/* Form Card */}
          <div className={contactStyles.cardRelative}>
            <div className={contactStyles.cardGradient}></div>
            <div className={contactStyles.cardContainer}>
              <div className={contactStyles.cardBadge}>
                <Ticket className={contactStyles.cardIcon} />
                BOOKING SUPPORT
              </div>
              <h2 className={contactStyles.formTitle}>
                <MessageCircle className={contactStyles.formTitleIcon} />
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className={contactStyles.form}>
                <div>
                  <label htmlFor="name" className={contactStyles.inputGroup}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={contactStyles.input}
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className={contactStyles.inputGroup}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={contactStyles.input}
                    placeholder="your@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={contactStyles.inputGroup}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    title="Enter a 10-digit Phone number"
                    className={contactStyles.input}
                    placeholder="Your Phone Number"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className={contactStyles.inputGroup}>
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={contactStyles.select}
                  >
                    <option value="">Select a subject</option>
                    <option value="Ticket Booking">Ticket Booking</option>
                    <option value="Group Events">Group Events</option>
                    <option value="Membership">Membership Inquiry</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Refund">Refund Request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className={contactStyles.inputGroup}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className={contactStyles.textarea}
                    placeholder="Please describe your inquiry in details..."
                  ></textarea>
                </div>
                <button type="submit" className={contactStyles.submitButton}>
                  Send via WhatsApp
                  <Send className={contactStyles.buttonIcon} />
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className={contactStyles.cardRelative}>
            <div className={contactStyles.cardGradient}></div>
            <div className={contactStyles.cardContainer}>
              <h2 className="text-2xl font-bold mb-6 text-red-400 flex items-center pt-2">
                <MessageCircle className="mr-3" />
                Contact Information
              </h2>
              <div className={contactStyles.contactInfo}>
                <div className={contactStyles.contactItem}>
                  <div className={contactStyles.contactIconContainer}>
                    <MessageCircle className={contactStyles.contactIcon} />
                  </div>
                  <div>
                    <h3 className={contactStyles.contactText}>Booking Hotline</h3>
                    <p className={contactStyles.contactDetail}>+91 9876543210</p>
                  </div>
                </div>
                <div className={contactStyles.contactItem}>
                  <div className={contactStyles.contactIconContainer}>
                    <Send className={contactStyles.contactIcon} />
                  </div>
                  <div>
                    <h3 className={contactStyles.contactText}>Email Address</h3>
                    <p className={contactStyles.contactDetail}>bookings@cinebharat.com</p>
                    <p className={contactStyles.contactSubDetail}>support@cinebharat.com</p>
                  </div>
                </div>
                <div className={contactStyles.contactItem}>
                  <div className={contactStyles.contactIconContainer}>
                    <Ticket className={contactStyles.contactIcon} />
                  </div>
                  <div>
                    <h3 className={contactStyles.contactText}>Main Theater Location</h3>
                    <p className={contactStyles.contactDetail}>
                      123 Cinema Street, Film City, Mumbai, MH 400001
                    </p>
                    <p className={contactStyles.contactSubDetail}>+4 other locations across the city</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default ContactPage;
