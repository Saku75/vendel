export default {
  async email(message) {
    const forwardingMails: {
      alias: string;
      forwardTo: string;
    }[] = [
      { alias: "gert@vendel.dk", forwardTo: "gertvendelmann@proton.me" },
      { alias: "jens@vendel.dk", forwardTo: "jensvendellarsen@gmail.com" },
      { alias: "julie@vendel.dk", forwardTo: "julievendel@hotmail.com" },
      { alias: "karina@vendel.dk", forwardTo: "karinavendel@gmail.com" },
      { alias: "lukas@vendel.dk", forwardTo: "lvmann@proton.me" },
      { alias: "susan@vendel.dk", forwardTo: "susanvendel@gmail.com" },
    ];

    const forwardingMail = forwardingMails.find(
      (value) => value.alias === message.to.toLocaleLowerCase(),
    );

    if (!forwardingMail) {
      await message.forward("vendel-admin@proton.me");
      return;
    }

    await message.forward(forwardingMail.forwardTo);
  },
} satisfies ExportedHandler<CloudflareBindings>;
