import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { initAnalytics } from "@/lib/analytics";
import {
  A,
  H2,
  Item,
  LegalPage,
  List,
  P,
  Warning,
} from "@/components/legal-page";

function Terms() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="26 AUG 2026"
      lede="These terms tell you how to use rattlesnakemtn.com. The site shows automatic data. The data can be old or incorrect. Do not use the data for safety decisions."
    >
      <H2>Agreement</H2>
      <P>
        When you use rattlesnakemtn.com, you accept these terms. If you do not
        accept these terms, do not use the site. The site is free. You do not
        make an account. You do not pay.
      </P>

      <H2>The data is for information only</H2>
      <P>
        The site shows data from instruments on the mountain and from weather
        agencies. Software collects and publishes this data automatically. No
        person examines the data before you see it. The data can be incorrect
        for these reasons:
      </P>
      <List>
        <Item>
          Instruments become inaccurate. Ice can cover them. They can stop.
        </Item>
        <Item>
          The radio link can stop. The page then continues to show old data.
        </Item>
        <Item>
          The camera can freeze. Fog can cover the lens. The image can become
          dark.
        </Item>
        <Item>
          The SNOTEL sites are some distance from this mountain. Their data
          shows the conditions at those sites, not the conditions here.
        </Item>
        <Item>A forecast is a prediction. It can be incorrect.</Item>
      </List>

      <Warning title="Do not use this site for safety decisions">
        <P>
          Conditions on a mountain change more quickly than the five-minute data
          interval. One instrument shows the conditions at one point. It does
          not show the conditions on the road, on the pass, or on the slope
          where you are.
        </P>
        <P>Do not use this site to make decisions about:</P>
        <List>
          <Item>vehicle travel</Item>
          <Item>mountain travel or backcountry skiing</Item>
          <Item>avalanche risk</Item>
          <Item>aviation</Item>
          <Item>search and rescue operations</Item>
        </List>
        <P>For these decisions, use the official sources:</P>
        <List>
          <Item>
            <A href="https://www.weather.gov/sew/">
              National Weather Service — Seattle
            </A>{" "}
            for watches, warnings, and forecasts.
          </Item>
          <Item>
            <A href="https://nwac.us/">Northwest Avalanche Center</A> for
            avalanche conditions.
          </Item>
          <Item>
            <A href="https://wsdot.com/travel/real-time/map">WSDOT</A> for pass
            reports and road conditions.
          </Item>
        </List>
      </Warning>

      <H2>No warranty</H2>
      <P>
        We supply the site and its contents "as is" and "as available", without
        warranty of any kind, express or implied. This includes any implied
        warranty of merchantability, fitness for a particular purpose, accuracy,
        timeliness, or uninterrupted availability. The site can be unavailable,
        old, or incorrect at any time, without notice.
      </P>

      <H2>Limit of liability</H2>
      <P>
        The operator of the site is not liable for any loss, injury, or damage
        of any kind. This includes loss, injury, or damage that results from
        your use of the site or from the data that the site shows. This limit
        applies to the fullest extent that the law permits. Some jurisdictions
        do not permit some of these limits. In those jurisdictions, the
        narrowest limit that the law permits applies.
      </P>

      <H2>Data from other organizations</H2>
      <P>
        The National Weather Service supplies the forecast data. The USDA
        Natural Resources Conservation Service supplies the snowpack data. Those
        agencies produce that data. The data is usually in the public domain.
        The terms and the disclaimers of those agencies apply to it. Those
        agencies do not endorse this site.
      </P>

      <H2>Permitted use</H2>
      <P>
        You can look at the mountain as frequently as you want. Do not try to
        disrupt this site, the camera, the station, or the feeds that supply
        them. Do not try to overload them. Do not try to get unauthorized access
        to them. The public feeds that this page reads are shared equipment and
        have rate limits. The station publishes new data every five minutes.
        More frequent requests give you no new data.
      </P>

      <H2>Content and source code</H2>
      <P>
        The design, the text, and the images of the site, which include the
        camera frames, belong to the operator of the site. The source code is in
        the{" "}
        <A href="https://github.com/rattlesnakemountain/rattlesnakemtn.com">
          public repository
        </A>{" "}
        of the site. The license that the repository states applies to the
        source code. You can link to the site. You can show a camera frame if
        you give credit to the site. Do not show the images or the data as your
        own.
      </P>

      <H2>Changes to these terms</H2>
      <P>
        We can change these terms at any time. We put the current terms on this
        page and show the date at the top. If you continue to use the site after
        a change, you accept the new terms.
      </P>

      <H2>Governing law</H2>
      <P>
        The laws of the State of Washington, USA, govern these terms, without
        regard to conflict-of-law rules.
      </P>

      <H2>Contact</H2>
      <P>
        To ask a question about these terms, use the{" "}
        <A href="https://github.com/rattlesnakemountain/rattlesnakemtn.com/issues">
          public repository
        </A>{" "}
        of the site. Refer also to the <A href="/privacy/">privacy policy</A>.
      </P>
    </LegalPage>
  );
}

initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Terms />
  </StrictMode>
);
