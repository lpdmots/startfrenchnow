"use server";
import { getMailOptions, transporter } from "../lib/nodemailer";

const emailYoh = process.env.EMAILYOH;
const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

interface ContactFromFideFormData {
    objectif?: FormDataEntryValue | null;
    niveauActuel?: FormDataEntryValue | null;
    niveauSouhaite?: FormDataEntryValue | null;
    message?: FormDataEntryValue | null;
    email: FormDataEntryValue | null;
}

// Generate email content based on provided fields
const generateEmailContent = ({ email, objectif, niveauActuel, niveauSouhaite, message }: ContactFromFideFormData) => {
    const textContent = `
    Nouveau message de contact :
    Email: ${email}
    Objectif: ${objectif ?? "Non spécifié"}
    Niveau Actuel: ${niveauActuel ?? "Non spécifié"}
    Niveau Souhaité: ${niveauSouhaite ?? "Non spécifié"}
    Message: ${message ?? "Non spécifié"}
  `;

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
      <h2 style="color: #007BFF;">Nouveau message de contact</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Objectif:</strong> ${objectif ?? "Non spécifié"}</p>
      <p><strong>Niveau Actuel:</strong> ${niveauActuel ?? "Non spécifié"}</p>
      <p><strong>Niveau Souhaité:</strong> ${niveauSouhaite ?? "Non spécifié"}</p>
      <p><strong>Message:</strong><br/>${message ?? "Non spécifié"}</p>
    </div>
  `;

    return { text: textContent, html: htmlContent };
};

// Server action for sending emails
export const sendContactEmail = async (data: ContactFromFideFormData, type: string = "form"): Promise<{ status: string; error?: string }> => {
    const { email, objectif, niveauActuel, niveauSouhaite, message } = data;

    if (!email) {
        return { status: "error", error: "noEmail" };
    }

    // Email content to Yohann
    const messageForYoh =
        type === "input" ? "Demande envoyée depuis le bandeau." : type === "pdf" ? "Demande de pdf effectuée." : type === "blog" ? "Demande d'entretien depuis un article du blog" : message;
    const yohannEmailContent = generateEmailContent({ email, objectif, niveauActuel, niveauSouhaite, message: messageForYoh });

    // Send email to Yohann
    try {
        await transporter.sendMail({
            ...getMailOptions("yohann"),
            subject: "Nouveau contact FIDE",
            text: yohannEmailContent.text,
            html: yohannEmailContent.html,
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email à Yohann:", error);
        return { status: "error", error: "errorYohann" };
    }

    const infosEn =
        type === "form"
            ? `<p><strong>Here’s a summary of the information you provided:</strong></p>
        <ul style="padding-left: 20px;">
            <li><strong>Goal:</strong> ${objectif ? objectif : "Not specified"}</li>
            <li><strong>Current Level:</strong> ${niveauActuel ? niveauActuel : "Not specified"}</li>
            <li><strong>Target Level:</strong> ${niveauSouhaite ? niveauSouhaite : "Not specified"}</li>
            <li><strong>Specific Message:</strong> ${message ? message : "Not specified"}</li>
        </ul>`
            : "";

    // Email content to user
    const userHtmlContent =
        type === "pdf"
            ? `<html><div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
  <p>Salut, c'est Yohann.</p>
  
  <p>Thank you for requesting your free guide! You can download it by clicking the link below:</p>
  
  <p>
    <a href="${cloudFrontDomain + "fide/fide-exam-presentation.pdf"}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">Download the guide</a>
  </p>

  <p style="margin-top: 30px;"><strong>How about taking it a step further?</strong></p>
  
  <p>I’d like to offer you a quick, free, no-obligation chat to discuss your French learning goals. Together, we can create a personalized plan to help you make progress efficiently. You can <a href="https://calendly.com/yohann-startfrenchnow/15min" style="color: #1a73e8; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center;">
    <span style="margin-right: 5px;">book here</span> &#x27A1;
  </a>, it's very easy. 
    
  </p>
  
  <p>Feel free to reply to this email if you have any questions in the meantime.</p>
  
  <p>Talk to you soon,<br/>Yohann</p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
  
  <!-- Signature avec flexbox -->
  <div style="display: flex; align-items: center; margin-top: 20px;">
    <img src="https://www.startfrenchnow.com/images/yoh-coussot-red-small.png" alt="Yohann Coussot" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; margin-right: 15px;" />

    <p style="margin: 0;">
      Yohann Coussot<br/>
      Formateur Fide<br/>
      <a href="https://www.startfrenchnow.com" style="color: #1a73e8; text-decoration: none;">www.startfrenchnow.com</a>
    </p>
  </div>

  <p style="margin-top: 20px; font-size: 14px; color: #666;">If you are expecting a response from us, please make sure to check your spam or junk folder as well, just in case our emails end up there.</p>
</div>
</html>
`
            : `
            <html><div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <p>Salut, c'est Yohann.</p>
        
        <p>
  Thanks a lot for trusting me and sending your request. I'll get back to you as soon as possible, and if you're interested, we can set up a quick, free chat to better understand your goals and create a personalized plan that works for you. It's easy, you can
  <a href="https://calendly.com/yohann-startfrenchnow/15min" style="color: #1a73e8; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center;">
    <span style="margin-right: 5px;">book here</span> &#x27A1;
  </a>.
</p>
        
        ${infosEn}
        
        <p>Feel free to reply to this email if you have any questions in the meantime.</p>
        
        <p>Talk to you soon,<br/>Yohann</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        
        <div style="display: flex; align-items: center; margin-top: 20px;">
  <img src="https://www.startfrenchnow.com/images/yoh-coussot-red-small.png" alt="Yohann Coussot" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; margin-right: 15px;" />

  <p style="margin: 0;">
    Yohann Coussot<br/>
    Formateur Fide<br/>
    <a href="https://www.startfrenchnow.com" style="color: #1a73e8; text-decoration: none;">www.startfrenchnow.com</a>
  </p>
</div>
        </div></html>
    `;

    const userTextContent = `
    Salut, c'est Yohann.

Merci pour votre intérêt. Je vais vous répondre au plus vite et je vous proposerai, si vous le souhaitez, une entrevue rapide et gratuite pour mieux comprendre vos objectifs et élaborer ensemble un plan personnalisé qui vous convient parfaitement.

À bientôt,
Yohann
  `;

    // Send confirmation email to the user
    try {
        await transporter.sendMail({
            from: emailYoh,
            to: email,
            subject: type === "pdf" ? "Your FIDE guide + a proposal to go further!" : "Confirmation of your FIDE learning plan request",
            text: userTextContent,
            html: userHtmlContent,
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email de confirmation à l'utilisateur:", error);
        return { status: "error", error: "errorConfirmation" };
    }

    return { status: "success" };
};

/* 
const infosFr =
        type === "form"
            ? `<p>Voici un résumé de vos informations :</p>
      <ul>
        <li><strong>Objectif :</strong> ${objectif ? objectif : "Non spécifié"}</li>
        <li><strong>Niveau Actuel :</strong> ${niveauActuel ? niveauActuel : "Non spécifié"}</li>
        <li><strong>Niveau Souhaité :</strong> ${niveauSouhaite ? niveauSouhaite : "Non spécifié"}</li>
        <li><strong>Message spécifique :</strong> ${message ? message : "Non spécifié"}</li>
      </ul>`
            : "";

<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
      <p>Bonjour, c'est Yohann !</p>
      <p>Merci beaucoup de m'avoir fait confiance et de m'avoir envoyé votre demande. Je vais y répondre au plus vite et je vous proposerai, si vous le souhaitez, une entrevue rapide et gratuite pour mieux comprendre vos objectifs et élaborer ensemble un plan personnalisé qui vous convient parfaitement.</p>
      ${infosFr}
      <p>En attendant, n'hésitez pas à répondre à ce message si vous avez des questions.</p>
      <p>À très bientôt,<br/>Yohann</p>
    </div>
*/
