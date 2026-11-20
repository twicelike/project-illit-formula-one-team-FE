#!/usr/bin/env node
/**
 * Downloads verified live ILLIT community assets (hero covers, member portraits,
 * artist post photos, video/LIVE thumbnails, fan posts, fan letters) from phinf.wevpstatic.net
 * into public/sites/weverse/community/illit/.
 */
import fs from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(
  process.cwd(),
  "public",
  "sites",
  "weverse",
  "community",
  "illit"
);

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  Referer: "https://weverse.io/",
  Origin: "https://weverse.io",
};

const ASSETS = [
  {
    dest: "hero-desktop.jpg",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMTVfNDUg/MDAxNzkyMDYyODAzODYz.4k3Al_EyJndwufg2dv3uZNAsqF-nXRChJviTml_uGYog.qHVThJKrPk-aWiNtksPWpF2sP9_InrFNiHsYjd0_AAEg.JPEG/816b60f3-3d36-4b77-ab16-f01c3a1dda73.jpeg",
  },
  {
    dest: "hero-mobile.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMTVfODkg/MDAxNzkyMDYxODI2OTQy.Tmh1bcF_Xcm23D6yO4PMagTqkpVNq00b2QheFbymwnMg.hHOv6ssezZ1GD12OvuH_dbiX8p8szYF1posJUpjO7BMg.JPEG/5e96c1c4-26fe-4bb0-b07f-5975bb0925f2.jpeg?type=e1024_1024_webp",
  },
  {
    dest: "member-yunah.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMTVfMTM4/MDAxNzkyMDYyMzU1NzA4.1RhrveEwmskVkkjAIKpkArHvms3E5rQMiu8FpPZMdm0g.ImActsqMY_XHoJ5dcIhC6w_o2YRkD8u8RqNs5nPbBdIg.JPEG/777fe95f-f27a-44b6-bcd3-86355bdb16fc.jpeg?type=s156_webp",
  },
  {
    dest: "member-minju.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMTVfMTMy/MDAxNzkyMDYyMzY3MjY4.YNF3JuKEAJM9cs83ZDa9qeRoKYRakWe_n91sYK94hlAg.0V0TeyU1uoI_4jwM2h59BAF2UWMSpsgsPr4DL6rc318g.JPEG/3167b598-128c-4a4f-be0a-5daca90fb950.jpeg?type=s156_webp",
  },
  {
    dest: "member-moka.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA0MjRfMjEx/MDAxNzc3MDM0MDk4Mzkw.Q817PIh7GZgUXueN8j0v2iL9V89VU4QJA1aJ4FrFDWcg.A_7FJBhd4huxdb5N5AfjO4EidE2wyVrncrJMxaf0QWAg.JPEG/ab8acff0-fb1a-4ff4-8e65-7af35e6b2df6.jpeg?type=s156_webp",
  },
  {
    dest: "member-wonhee.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMTVfMjAy/MDAxNzkyMDYyMzc5MTUx.XpUiUbEMtQ5ZTP_MshZ6UQqyW_njE5vzg4eSrPdRQm0g.UtjRO9g_5SsnoLp5MaWa6dzQNO9ZaQbcI4Kbd-eULAYg.JPEG/3694b15d-4389-4e1f-9fe2-63c694ef02ec.jpeg?type=s156_webp",
  },
  {
    dest: "member-iroha.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMTVfNjcg/MDAxNzkyMDYyMzkxNzkz.hmzbH7LPubTrysqBBI5ae9CNqpF2y2BHQoHoJJ3JzFQg.NN7j5JrxDtvzbGfgGADGZdORhhhB9k-tEZprL9Y91Iwg.JPEG/f46c6d1c-bb92-4b99-87e6-8b891295b7aa.jpeg?type=s156_webp",
  },
  {
    dest: "artist-iroha-avatar.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA0MDVfMyAg/MDAxNzc1MzE2MzQ1MjY5.ISK16gCYya0XL9aVv2cvLjNi9f-ZeUNgA0natVcO9ggg.wUBnw3c2_I65PSsRQUJtzUqNvNZezkO0b1Q1RG58pkkg.JPEG/image.jpg?type=s156_webp",
  },
  {
    dest: "post-1.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTdfMiAg/MDAxNzk0ODgxNTU2NTQy.1wWOSQVW-2Z4HKSiFHqj9Z-4XbqQ4fRVYRqzWpMtC9cg.THDfMIeHjoxVbulzyAlEtMgZGtGDmygX8T-QTIXSG-wg.JPEG/image.jpg?type=e1388_1388_stopgif_webp",
  },
  {
    dest: "post-2.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTdfMzIg/MDAxNzk0ODgxNTU2NDk2.bAIfbBkdf21gtQSqrkLI1q1-Tj0buVq8HOtaSx8y7Pog.Q9aghGtbCfquFJjx5BQxCIiLrCx1kTthiQC3lm-HLI8g.JPEG/image.jpg?type=e1388_1388_stopgif_webp",
  },
  {
    dest: "post-3.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTdfMjc4/MDAxNzk0ODgxNTU2NTY4.TppBTNWrZMx7s8P92ztSKHGsp-bageYUmYMNVrlY1Ssg.ZksmXG1eptPWz-BAiqEPmYB6upyb8VkVng9R73AhMxgg.JPEG/image.jpg?type=e1388_1388_stopgif_webp",
  },
  {
    dest: "video-thumb.jpg",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTlfMTc5/MDAxNzk1MDQ3NzQ5NzE1.WDHm-NpLyi1Z-366FiRDxSXAwBvORi1M4XfZB-TiboAg.vUXKotZZTyi_7VZNpUNhdMTqTrPG5XyPOymeVFyuRjYg.JPEG/17ca7415-e827-41f8-a359-9a27fd7c8384.jpeg",
  },
  {
    dest: "live-thumb.jpg",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTlfMTY1/MDAxNzk1MDkwMzEyODk3.InVal3GBwX0aeGyENmCZIAKgOgPBFZ0YxJVuAokeiiwg.YMl3L_pLBHu2ifeQW0Mi3lkLVXI8IApa99ajZlneQEMg.JPEG/image.jpg",
  },
  {
    dest: "fan-post-1.jpg",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTdfMTI4/MDAxNzk0ODYzODE3MzAw.Xx0O4ozDWOKhsIvJKyZrage62vIK21pqwON_g-I0EyYg.GhX223qJdlcv1kbvdMc909mAQKKqI_TNgh2bnomYkp8g.JPEG/Weverse_7adc0.jpg",
  },
  {
    dest: "fan-avatar-1.jpg",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMTZfMTc3/MDAxNzkyMTQ2NDI2MDIw.ZeTWL9kgSOf87X7vLMKYqEEsLoOsTZUi4Od8HUyH7IUg.DxsLNW_xhHCewQwZyn0lBIDteV9VOGIbIzNpDm41Qzkg.JPEG/Weverse_e94f8.jpg",
  },
  {
    dest: "fan-post-2.png",
    url: "https://phinf.wevpstatic.net/MjAyNjExMjBfMTIw/MDAxNzk1MTQ5MjAzNDEy.l8FuVyi753hxOAbT_vP7E-oxLt6hO1MQzlNX-YZZTbgg.nvg_oQ38YH0LzioCvPo1ZYjKyclWsk2UC7jeGTfy8Rsg.PNG/Weverse_6c630.png",
  },
  {
    dest: "fan-letter-1.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTlfMTM0/MDAxNzk1MDgyNDYxMTQz.kRTkLQGqVRTcTbfsTkP0f17zAOJ9Y3JVOzXTOqBHCe4g.WeYKNossd5ah8Cm6uBI0WRqSoF4fqLKn7LMT4kNjzvMg.PNG/Weverse_7a1ad.png?type=f676_1080_webp",
  },
  {
    dest: "fan-letter-2.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjAxMTFfMTY3/MDAxNzY4MTI2ODU1NTYz.eiGRatKrSri21ZtA3ymDwMngGJvjbkau4pY7cFET_gUg.xEQY8xDLbTkDyIYnvv1tHaxXr91ins32pFHScumguowg.PNG/Weverse_083c3.png?type=f676_1080_webp",
  },
];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  let ok = 0;
  let totalBytes = 0;
  const failures = [];

  await Promise.all(
    ASSETS.map(async (item) => {
      try {
        const res = await fetch(item.url, { headers: HEADERS });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 100) throw new Error(`Too small: ${buf.length}B`);
        await fs.writeFile(path.join(OUT_DIR, item.dest), buf);
        ok += 1;
        totalBytes += buf.length;
      } catch (err) {
        failures.push({ dest: item.dest, error: String(err) });
      }
    })
  );

  console.log(
    `Community assets complete: ${ok}/${ASSETS.length} (${(totalBytes / 1024).toFixed(1)} KB)`
  );
  if (failures.length > 0) {
    console.error("Failures:", failures);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
