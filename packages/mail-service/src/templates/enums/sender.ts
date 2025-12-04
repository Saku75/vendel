import { MailDomain } from "../../enums/domain";
import { MailSender } from "../../enums/sender";
import { MailTemplate } from "../../enums/template";
import { MailAddress } from "../../types/address";
import { createAddress } from "../../utils/create-address";

const MailTemplateSender: Record<MailTemplate, MailAddress> = {
  [MailTemplate.ConfirmEmail]: {
    name: "Vendel.dk - Support",
    address: createAddress(MailSender.Accounts, MailDomain.SupportVendel),
  },
} as const;

export { MailTemplateSender };
