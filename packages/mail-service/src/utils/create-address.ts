import type { MailDomain } from "../enums/domain";
import type { MailSender } from "../enums/sender";

function createAddress(sender: MailSender, domain: MailDomain) {
  return `${sender}@${domain}`;
}

export { createAddress };
