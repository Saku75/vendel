import type { MailAddress } from "../../types/address";
import { createAddress } from "../../utils/create-address";
import { MailDomain } from "../domain";
import { MailSender } from "../sender";

const MailTemplateSender: Record<MailSender, MailAddress> = {
  [MailSender.Accounts]: {
    name: "Vendel.dk",
    address: createAddress(MailSender.Accounts, MailDomain.SupportVendel),
  },
  [MailSender.Admin]: {
    name: "Vendel.dk - Admin",
    address: createAddress(MailSender.Admin, MailDomain.SupportVendel),
  },
  [MailSender.Contact]: {
    name: "Vendel.dk",
    address: createAddress(MailSender.Contact, MailDomain.SupportVendel),
  },
} as const;

export { MailTemplateSender };
