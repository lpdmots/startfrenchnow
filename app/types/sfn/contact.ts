export interface ContactForm {
    name: string;
    email: string;
    subject: string;
    message: string;
    mailTo: string;
    website?: string; // honeypot
}
