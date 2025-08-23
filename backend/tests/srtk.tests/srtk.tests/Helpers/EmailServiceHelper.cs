using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using srtk.Services;

namespace srtk.tests.Helpers
{
    public class EmailServiceHelper : EmailService
    {
        public EmailServiceHelper() : base(new Microsoft.Extensions.Options.OptionsWrapper<Email>(new Email()))
        {
        }

        public async override Task SendEmail(string to, string subject, string bodyHtml)
        {
            await Task.CompletedTask;
        }
    }
}
