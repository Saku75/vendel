import { MailDomain } from "../enums/domain";
import { MailSender } from "../enums/sender";

function createAddress(sender: MailSender, domain: MailDomain) {
  return `${sender}@${domain}`;
}

export { createAddress };
