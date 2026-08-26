import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { initAnalytics } from "@/lib/analytics";
import { A, H2, Item, LegalPage, List, P } from "@/components/legal-page";

function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="26 AUG 2026"
      lede="The site has no accounts and no forms. It counts page views. It does not collect data that identifies you."
    >
      <H2>Summary</H2>
      <P>
        rattlesnakemtn.com is a static web page. It shows data from a weather
        station and a camera on Rattlesnake Mountain, Washington. The site has
        no server and no database of its own. The site does not ask you for
        data. We do not collect your name, your email address, or other data
        that identifies you. We do not sell visitor data and we do not give it
        to other organizations.
      </P>

      <H2>Analytics</H2>
      <P>
        The site uses{" "}
        <A href="https://www.cloudflare.com/web-analytics/">
          Cloudflare Web Analytics
        </A>{" "}
        to count visits. This service does not use cookies. It does not put an
        identifier in your browser. It does not follow you to other websites. We
        selected it because it collects less data than the alternatives.
      </P>
      <P>The service reports these items to us:</P>
      <List>
        <Item>the pages that visitors opened, and how many times</Item>
        <Item>
          the website or the search engine that sent the visitor, if the browser
          supplies it
        </Item>
        <Item>the country of the visit</Item>
        <Item>general types of browser, operating system, and device</Item>
        <Item>the speed at which the pages load</Item>
      </List>
      <P>
        Cloudflare reads your IP address at its network edge. It uses the IP
        address for two functions: to find the country, and to remove automatic
        traffic from the counts. Cloudflare does not keep the IP address for
        analytics. Cloudflare does not make a profile of you. The{" "}
        <A href="https://www.cloudflare.com/privacypolicy/">
          Cloudflare privacy policy
        </A>{" "}
        applies to this data.
      </P>
      <P>
        There is no cookie to identify one visit from the next. Thus the visitor
        counts are approximate. We accept this condition because we do not want
        to track visitors.
      </P>
      <P>
        Some content blockers and privacy extensions stop the analytics script.
        If yours stops it, the site operates normally. No function of this site
        needs the analytics.
      </P>

      <H2>What your browser keeps</H2>
      <P>
        The site sets no cookies. The site puts one item in the local storage of
        your browser: your selection of the light theme or the dark theme. The
        page uses this item to show the correct colors immediately on your next
        visit. This item stays on your device. It does not go to a server and we
        cannot read it. To remove it, clear the site data in your browser.
      </P>

      <H2>Data that your browser gets from other organizations</H2>
      <P>
        This site has no server component. Your browser gets each reading
        directly from the organization that publishes it. Therefore these
        organizations receive a request from your browser. The request includes
        your IP address and the identification of your browser. This is usual
        for all websites. The sources are:
      </P>
      <List>
        <Item>
          <strong className="font-medium text-(--fg)">
            Google Cloud Storage
          </strong>{" "}
          — the station data. The tower publishes it again every five minutes.
        </Item>
        <Item>
          <strong className="font-medium text-(--fg)">
            cam.rattlesnakemtn.com
          </strong>{" "}
          — the camera image, from our own equipment.
        </Item>
        <Item>
          <strong className="font-medium text-(--fg)">
            USDA SNOTEL (wcc.sc.egov.usda.gov)
          </strong>{" "}
          — the snowpack data from federal sites near the mountain.
        </Item>
        <Item>
          <strong className="font-medium text-(--fg)">
            National Weather Service (api.weather.gov)
          </strong>{" "}
          — the forecast for the gridpoint of the mountain.
        </Item>
      </List>
      <P>
        We do not control these services. These services do not send us data
        about you. The privacy policy of each organization applies to these
        requests.
      </P>

      <H2>Hosting</H2>
      <P>
        <A href="https://pages.github.com/">GitHub Pages</A> supplies the site
        as static files. GitHub keeps server logs of the requests that it
        supplies. These logs include IP addresses. We cannot read these logs.
        Refer to the{" "}
        <A href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
          GitHub Privacy Statement
        </A>{" "}
        for more data about them.
      </P>

      <H2>Children</H2>
      <P>
        This site is not for children. The site does not knowingly collect data
        from any person. This includes children less than 13 years old.
      </P>

      <H2>Your options</H2>
      <P>
        We do not collect or keep personal data. Therefore there is no data for
        you to examine, correct, or delete. If you do not want the site to count
        your visit, use a content blocker that blocks{" "}
        <code className="font-mono text-[13px] text-(--fg)">
          static.cloudflareinsights.com
        </code>
        . The Do Not Track setting and the Global Privacy Control setting of
        your browser also stop the count, if your blocker obeys them.
      </P>

      <H2>Changes to this policy</H2>
      <P>
        If we change this policy, we put the new policy on this page. We also
        change the date at the top of the page. The summary above shows any
        important change.
      </P>

      <H2>Contact</H2>
      <P>
        To ask a question about this policy, use the{" "}
        <A href="https://github.com/rattlesnakemountain/rattlesnakemtn.com/issues">
          public repository
        </A>{" "}
        of the site.
      </P>
    </LegalPage>
  );
}

initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Privacy />
  </StrictMode>
);
