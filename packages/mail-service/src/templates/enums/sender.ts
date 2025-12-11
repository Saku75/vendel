import { MailDomain } from "../../enums/domain";
import { MailSender } from "../../enums/sender";
import { MailTemplate } from "../../enums/template";
import type { MailAddress } from "../../types/address";
import { createAddress } from "../../utils/create-address";

const MailTemplateSender: Record<MailTemplate, MailAddress> = {
  [MailTemplate.Welcome]: {
    name: "Vendel.dk",
    address: createAddress(MailSender.Contact, MailDomain.SupportVendel),
  },
  [MailTemplate.ConfirmEmailNew]: {
    name: "Vendel.dk",
    address: createAddress(MailSender.Contact, MailDomain.SupportVendel),
  },
  [MailTemplate.ConfirmEmailResend]: {
    name: "Vendel.dk",
    address: createAddress(MailSender.Contact, MailDomain.SupportVendel),
  },
  [MailTemplate.ApprovalRequest]: {
    name: "Vendel.dk - Admin",
    address: createAddress(MailSender.Admin, MailDomain.SupportVendel),
  },
} as const;

export { MailTemplateSender };
