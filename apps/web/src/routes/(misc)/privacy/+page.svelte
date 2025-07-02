<script>
  import Link from "$lib/components/common/interactions/link.svelte";
</script>

<main class="mx-auto flex h-full w-full max-w-3xl flex-col gap-6 px-2">
  <div class="flex flex-col gap-2">
    <h1 class="font-sans text-3xl font-bold">
      Privatlivspolitik for Vendel.dk
    </h1>
    <p>
      Hos <b> Vendel.dk</b> tager vi dit privatliv alvorligt. Vi indsamler kun den
      data, vi har brug for, og vi deler den aldrig med tredjeparter.
    </p>
  </div>

  <section class="flex flex-col gap-2">
    <h2 class="font-sans font-bold">Hvilke data indsamler vi?</h2>
    <p>Vi indsamler kun personlige oplysninger, når det er nødvendigt:</p>
    <ul class="list-disc pl-6">
      <li>
        Hvis du opretter en konto, gemmer vi din e-mail og adgangskode
        (sikkert).
      </li>
      <li>
        Hvis du reserverer en gave via et delbart ønskelink, gemmer vi dit navn
        og tilknytter reservationen til ønskelisten. Det kræver ikke en konto.
      </li>
    </ul>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="font-sans font-bold">Brug af cookies</h2>
    <p>Vi bruger cookies til:</p>
    <ul class="list-disc pl-6">
      <li>At holde dig logget ind.</li>
      <li>At huske dine præferencer, som f.eks. tema (lys/mørk).</li>
      <li>
        Nødvendige Cloudflare-cookies, som hjælper med sikkerhed og ydeevne.
      </li>
    </ul>
    <p>
      Vi bruger <b>ikke</b> cookies til reklamer eller tracking på tværs af hjemmesider.
    </p>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="font-sans font-bold">Analyse</h2>
    <p>
      Vi bruger <b>Cloudflare Web Analytics</b> til at forstå, hvordan siden bruges
      — helt uden at spore dig personligt. Dine data bliver ikke delt med andre.
    </p>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="font-sans font-bold">Ingen deling af data</h2>
    <p>
      Vi sælger, deler eller udleverer <b>ikke dine oplysninger</b> til tredjeparter.
      Aldrig.
    </p>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="font-sans font-bold">Sletning af data</h2>
    <p>
      Du kan til enhver tid slette din konto og dermed alle dine tilknyttede
      oplysninger. Vi gemmer ikke personlige data længere end nødvendigt.
    </p>
  </section>

  <section class="flex flex-col gap-2">
    <h2 class="font-sans font-bold">Kontakt</h2>
    <p>
      Hvis du har spørgsmål om dine data eller denne politik, er du altid
      velkommen til at kontakte os på:
    </p>
    <Link href="mailto:privay@support.vendel.dk">
      privacy@support.vendel.dk
    </Link>
  </section>
</main>
