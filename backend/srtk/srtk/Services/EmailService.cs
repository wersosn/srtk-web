using System;
using MailKit.Net.Smtp;
using MailKit;
using MimeKit;
using Microsoft.Extensions.Options;

namespace srtk.Services
{
    public class Email // Pomocniczy model maila
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string From { get; set; }
        public string FromName { get; set; }
    }

    public class EmailService
    {
        private readonly Email _settings;

        public EmailService(IOptions<Email> settings)
        {
            _settings = settings.Value;
        }

        public async Task SendEmail(string to, string subject, string bodyHtml)
        {
            if (string.IsNullOrWhiteSpace(to))
            {
                throw new ArgumentException("Adres e-mail nie może być pusty", nameof(to));
            }

            //to = to.Trim();
            var email = new MimeMessage();

            email.From.Add(new MailboxAddress(_settings.FromName, _settings.From));
            email.To.Add(new MailboxAddress("", to));
            email.Subject = subject;
            email.Body = new TextPart(MimeKit.Text.TextFormat.Html)
            {
                Text = bodyHtml
            };

            using (var smtp = new SmtpClient())
            {
                smtp.ServerCertificateValidationCallback = (s, c, h, e) => true; // Tymczasowe ominięcie certyfiktu - usunąć po zrobieniu hostingu

                await smtp.ConnectAsync(_settings.Host, _settings.Port, MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_settings.Username, _settings.Password);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
        }
    }
}
