#!/usr/bin/env node
/**
 * Downloads all verified production assets from weverse.io (phinf.wevpstatic.net & cdn-v2pstatic.weverse.io)
 * into public/sites/weverse/ and generates src/app/weverse-fonts.css for local Pretendard v1.3.9 subsets.
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "sites", "weverse");
const FONTS_DIR = path.join(OUT_DIR, "fonts");
const FONTS_CSS_OUT = path.join(ROOT, "src", "app", "weverse-fonts.css");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
  Referer: "https://weverse.io/",
  Origin: "https://weverse.io",
};

const ASSETS = [
  // Favicon & Operational Promo Modal
  {
    dest: "logo192.png",
    url: "https://cdn-v2pstatic.weverse.io/weverse3/3_19_9/logo192.png",
  },
  {
    dest: "popup/black-friday.png",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTZfNzMg/MDAxNzk0ODE4MDAwMTM3.PWRlL-7v7_2fn-iku6cKPSfJ-P1RVkh7oJtxcIEdrHgg.T6N5PfKE6TkOVMO8PX1CeNJJcDv5WD7ifil_Zar4y8gg.PNG/1877513633465019745f8594de-2c5d-4314-803e-9bc41287b75b.png",
  },

  // 17 Hero Carousel Slides (?type=s1080_webp)
  {
    dest: "hero/slide-01.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTlfMTA2/MDAxNzk1MDY0MjI3NjI5.01tkI2xLbuMGMbjPxt6ncLfu-w2oNzT2NLcDFi7AgcYg.YnKqN4Tf-5ctrAJPJorobv4NVEK2_kwgkC9mKCp5NXwg.PNG/133319946688355026f322a26a-7c85-44e7-9a0a-ca1608e4ab57.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-02.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTlfMTE5/MDAxNzk1MDk0OTA0MjEz.xNEo5zVSKmTDBKWZJrTJhwiyFCzX3U8unE5S8sA1lzwg.KzpxoBBHw5Vd5w5lSzY7Tu2eK6BhM1_eQ90Xa7KlefIg.PNG/129544681432630301c9d690a8-23e7-45e3-8fcf-2c22d85b7edb.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-03.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTJfMTgx/MDAxNzk0NDY4NzI1NjUy.UgCDoZsPcbAGxfWDjIf5rukwrvgxdThbXRS2m0ym4mcg.qCik6NU3qmhIFu-D2Noznh0qHyZ3ZryS_00Pwvll6Ogg.PNG/187402088867488902327fd70b-fc04-4530-b852-533e044b1bda.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-04.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTlfMjQy/MDAxNzk1MDk0NzEzNDE0.ioCgcU167TUzcMZqI0jlBPWd95P56PPeHYXwlO9lZl0g.XYuUI8UT6vFCX4-RCKzjNnkfYNx2i0U7oi4EoqEmIS0g.PNG/381258663726637087c1e6d12-2b2b-49dc-922f-007159578002.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-05.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTlfMTk5/MDAxNzk1MDk0Njc0NTM0.4PG3Q5CJJt67FjsY_Od_7aN1LdJzI5tjNkHCLbZengYg.c-jZVeDJUQJqomkLcjj8zS1SnUVw7uz8evyyszoHNDEg.PNG/1295444517442290834e1df1e3-8f71-4157-9574-a0c1f3013fc7.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-06.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTlfODIg/MDAxNzk1MDk0NjM1MTgw.O3hQ7bBLRbgGJPJ-2Nfl4XauubPlD_jXwzwXBwzFSQEg.xkRWbcAO2kmwWZzZzGGlGTc55bMKkBr6jjAYBWRkhOog.PNG/1295444123979554953a8a378c-40ec-4558-8d6d-105036d9aedf.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-07.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTlfNDAg/MDAxNzk1MDk0NzY5Mzk0.E4Z0vROWlpJqFgMO5J8z4SKSOyor07NVXNEddQbPrc8g.Ypb7zAOW1Yx37eB3M1O8fPT_NRF2Cy7FeWKDvOLZOKAg.PNG/1295445466211911639b0389b7-00e6-4e91-b692-f499537a11ae.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-08.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTlfMTE3/MDAxNzk1MDk0NTQxNjY0.lW03B3Y-syU1uoLWrOA3HGf1GB5mfVVKRTyz8o2WshQg.8DoqVOaLUNBG9iNFGm5syGpkW88tB9B1MoZfJe3Fw4wg.PNG/12954431886591287167aac58a-ef10-4e24-a854-7283fbc44814.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-09.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTJfNDkg/MDAxNzk0NDY0ODAwMDA3.uWMSv3sFhCTkTs2AvyPeCOLnaVhRbISyiMu3J1PDXAIg.Ss66KBy1QGkSmDRPMXyAsDTU99-1Qnv1_z3yyvu9UDcg.PNG/187398163178952146daa85f55-997b-4d06-a081-78983a08a649.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-10.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMThfMTM1/MDAxNzk0OTYwOTA1MjU4.ucP23pmvWra7Q1h3vJwElyntQPHR82DFDmDtYVqerjUg.prRimMyC5HGCnKJ17lIg2J7dbzZGZLCbH9O-IjyEXucg.PNG/133018637551838936b4f67e16-5131-4c51-ace9-348dc8b57fa9.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-11.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTJfMjkx/MDAxNzk0NDY0Nzk5NDA0.jcL5NYIOkylHTT1KsLEgIa9MoxOcwHYJseHC44A_QcAg.yET3XYM5uTnKJxvl494tKFhU0tmqPAoF3lsn-2OUQdYg.PNG/187398162582270421626d16c5-9afe-4a7e-9359-33b63bc33b2c.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-12.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTNfOTQg/MDAxNzk0NTM4MDUwMzA0.gNshiXPq7AosHI33YfKni4gwvVqAs5mavtH6mYnylvMg.fF9FFRjrr6GWk4GKSXw7dW3udfGkJO6UujxCAMR8j1Ug.PNG/132595782631361513c63ac77f-3b1b-45cc-9779-045046580751.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-13.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTJfMTQ5/MDAxNzk0NDYzODIwNjY2.MEHu80xIAZZqXBZoXDF4rCntq2SEvTVabMjh5OCJLnAg.UhcJN71Ml2JrQhC8tv5vdUGPQBjANo6Zzbeotmocp2Yg.PNG/1325215529824038759da4cc44-c6aa-4710-98fa-bf218e5964b5.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-14.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTNfMjY3/MDAxNzk0NTM3OTA1MTU5._OR14L99NBjwolsIQG2m9OH8ytqVlAOiuS4wUNyTVpwg.muYwzUZdgtJkLNcG_LiioO0B-cg7Y0eBs-sSTvBjRM0g.PNG/18747126833643473444cc2ea8-d653-4ec5-a6a5-53989d6e72c8.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-15.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMDlfMTcx/MDAxNzk0MjA1MTEzODM4.ISVgpddU9ysGYSzx7Omf6FbrB5Ii1W69fitHrjUJNjIg.Pz3scR72zhA3YOKPma2GWK6frtJLEBJJMaQX5vRK6Mcg.PNG/132460832886997706c2dd2c5c-2805-4d11-9a37-82a9beac2bb4.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-16.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMDZfNTkg/MDAxNzkzOTM0NjAwMzE5.cs6cPDrwudhBQWiBxgnfZAw6qsH250ws_D6f8KSVks8g.mkd5nuAKIMwwjyyP-lUG6aaIuaoINDP5YPjXMTbl1KYg.PNG/131992332646658575f20807c4-f13e-4c95-b4ad-8a7d31790755.png?type=s1080_webp",
  },
  {
    dest: "hero/slide-17.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMjFfMjk2/MDAxNzkyNTYyMTAzMjA0.2z-OpxRdTEOR3fpGO2x-KZnX-lPSPBEu1ISwlxABcd0g.YZ2f4OKNwNbDO6tOl1dJ4n_vuo6P4RK0yYLv0hzIXSUg.PNG/1854954664131694709eb4c1c9-0d00-43aa-8242-5c5d2bcc5bb0.png?type=s1080_webp",
  },

  // DM Artist Chips — Batch 1 (primary desktop screenshot)
  {
    dest: "dm/leesungkyoung.webp",
    url: "https://phinf.wevpstatic.net/MjAyMzA5MjBfNjMg/MDAxNjk1MTc0MTY1Mzkx.DZnqmiWtkWJb78s6TI6m41wMsePS_L905CJrVCmhb9cg.Y-dmUWtFPs3zIqHLXSOGpCOXYmRbj8HY1w0ANUbPjCEg.JPEG/3326128566834184867814372-61ac-4729-a03b-4475b69faf74.jpg?type=s156_webp",
  },
  {
    dest: "dm/ahnhyoseop.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA2MDNfMTI1/MDAxNzgwNDQwMTM3MTkx.jvjOvfVslHK-YA_iHFMGAqlD3sNCYDKKbxvveP3ptjAg._wu9RzPjZAUM8P156uV4jGSM6ZssTVM050Nc7FjW90wg.JPEG/4d5f067b-f7dc-45a8-a9fa-cf5c7b2c0adb.jpeg?type=s156_webp",
  },
  {
    dest: "dm/lesserafim.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA5MDJfODQg/MDAxNzg4MzYxMTI1MjUy.08V7Uc6HvDS791fgNnbftscyPJ20_oVbHB_7ysGLr_8g.KfNj9don2WqC4PTgync_gSR5aC5niZ6TYbmezde3aNEg.PNG/f588530e-8a80-4317-ab4e-7532b4a581e4.png?type=s156_webp",
  },
  {
    dest: "dm/whollin.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMDlfNTUg/MDAxNzk0MjAzMTU1NDYw.NlbCdjQ3Sz9xLuhjSJSkFGrVodNrrfQrjGjegM5cxZwg.IkdvzOY4Mip_tCwqwJVH5FCuz01FTWH1gqp02e3mo2cg.JPEG/06ef5588-587b-4b5e-9acd-d789bb3f1243.jpeg?type=s156_webp",
  },
  {
    dest: "dm/kimmyungsoo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNDA3MjVfNTQg/MDAxNzIxODg1NjQxODUy.nV0irCkaw9pcRxgGlxKSRWtqb_2c08fCTozo4S71-7kg.nB3JmIRZWWCaxrdIwWtNvS_i1VCfRyoZgdiemNvlxfMg.JPEG/872a0bcf-228b-4636-a30f-c26e1f6f80e1.jpeg?type=s156_webp",
  },
  {
    dest: "dm/kino.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjAzMzBfMjcz/MDAxNzc0ODM4MzgwNzk1.EDvf3DUTpdye53ak1bd8TqDLtqOqb9qQz13AQ32LyoQg.O-zKJkHHyrynASCqFPm7-iJPk-TmtRx-OxZ_XPyjL1cg.PNG/54fbdcdc-8756-477b-80f0-49e389f2289a.png?type=s156_webp",
  },
  {
    dest: "dm/sonnaeun.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTA3MjFfMjk2/MDAxNzUzMDg3ODk2Njgz.aG01bqnH3r55MgN9QfdOXfeSn3O1bWN2zXRGCh731tcg.YehqcwZGjAOzPD1ZMhXpcaaFpPXaBMa7a1eY85KqRgkg.JPEG/7e70c9a4-213a-4dd7-af66-b47c22d9e907.jpeg?type=s156_webp",
  },
  {
    dest: "dm/irise.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMTRfMjY0/MDAxNzkxOTc5Mzc4NzQ1.ruRAtP1hXeIi583e1p9-KUlKSPz7XtqvFRt16oErsCwg.P4SCoFSjK_GKxEaU-_x3MbDSGsR7CnNR_yNZiv86oW4g.JPEG/a96bd92a-9de9-459d-97c1-9d8735c63da5.jpeg?type=s156_webp",
  },
  {
    dest: "dm/byeonwooseok.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA2MjZfMjg5/MDAxNzgyNDY3NzMxMTcw.Kqa-05Yet53AbaE6302tt1rZG8qscEIH9e_QngXpr-kg.eyocbBy0dBxlfCJ36OuYwKV8CToRqWj1EGavmeNjmRsg.JPEG/3111162c-0f07-4ac2-a019-46b8179edc09.jpeg?type=s156_webp",
  },

  // DM Artist Chips — Batch 2 (reload #2)
  {
    dest: "dm/munkayoung.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA3MDVfNTMg/MDAxNzgzMjU3Mjg2MTk1.jOaU7kTp8PDvFGwmYlciG_iMwE8sEXat4VMD_MqluZAg.GfkhtI2e96b0RAb7nNZbvfUlaXCZE9tERT3s6GzcLlcg.PNG/009e71c0-1af5-4866-8cb2-6c3596a4073a.png?type=s156_webp",
  },
  {
    dest: "dm/winner.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTAxMjNfMjc3/MDAxNzM3NTk1Nzc3MDUx.R3LoToqYDUfKJVVGmzxBH4-JDlGlthTyaajQ9imJEJsg.VmM66FT9tahmLA0ZMochhzrQaaxaRMDFL6r_nxkbhfYg.JPEG/69183615164155708d2ad5d7a-f293-42a0-a0a2-1335e741b5aa.jpg?type=s156_webp",
  },
  {
    dest: "dm/yoonsanha.webp",
    url: "https://phinf.wevpstatic.net/MjAyMjA3MDhfNTEg/MDAxNjU3MjY4NTU5OTA1.IFS7t4tALad9oxgIRBvkLCtTCe_e81WzLoQsZymJCr8g.spQqGZBDc0hX5XBK31JziWm_eSTIDt1uSN9JrBfXUGcg.PNG/886575657676074b14db0cb-ad6c-420a-b9d3-050e2bc63f8b.png?type=s156_webp",
  },
  {
    dest: "dm/chuu.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA1MDRfMjM0/MDAxNzc3ODg1Mjk4NTY4.3YAVZP1tQFPvx8nlGt6rPKpN-XU-mMOHZaEOEV0gYSsg.d_djwjNt8KNaCpTRIoyaV0g8B8CwDgkO-Pcq2WH9yDQg.JPEG/d97e229a-ae82-4863-b44c-8e50f95b739c.jpeg?type=s156_webp",
  },
  {
    dest: "dm/tnx.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjAxMDdfNjkg/MDAxNzY3Nzc2MTczOTc0.-xKLa2o99zKIp-USO5AtrVx7WjaL4LzocqLUtHYTStEg.0NZdYjr12oPJrV4L9-epzKxhV9pmb4C9XYMKGpPPyqAg.JPEG/3286636b-e888-46cf-b645-f37228a2d4ed.jpeg?type=s156_webp",
  },
  {
    dest: "dm/sb19.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA4MjBfMzYg/MDAxNzg3MjE2MTc2NTEy.iFZKprtVKx002ASRQUiSJqHpHdiOIt83P0-lFqtyWP8g.uQ4cueSaYsu-Dd3NwuyZXRNSXHbQBYUqi-Cu5AJaUykg.PNG/0adc75bc-8a91-4873-984d-b940c00549a0.png?type=s156_webp",
  },
  {
    dest: "dm/marklee.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA3MjJfMjkx/MDAxNzg0NzE3NjAyNDUy.t9FNrOwCW_FX3R7umFwxzwE20s-fuZRlhLd6unlo5rkg.mQUWWSpgS7HaMuumu_VCHwy3FAZQhSPMnq1GaFfcOvUg.JPEG/692c92a7-fd78-4826-bd93-0178cbc5fae2.jpeg?type=s156_webp",
  },
  {
    dest: "dm/dxmon.webp",
    url: "https://phinf.wevpstatic.net/MjAyNDA2MTdfMzkg/MDAxNzE4NTk1NDM4ODg0.0ufOHmIpx3bYRhX3B9bzZ9TcKMZm7lG0WB9LHq0feMwg.zE-Z7tm0muvBRijej-khydZl5HtX-oOUy2vh5fUyIcog.JPEG/52349938344984949f941a7d8-4c9e-416c-944f-5cbb5016c4df.jpg?type=s156_webp",
  },

  // Top 5 initial-load Featured Artists (reqid 195..203 — exact mapping verified visually after download)
  {
    dest: "artists/top-195.webp",
    url: "https://phinf.wevpstatic.net/MjAyNDA3MDVfMTY2/MDAxNzIwMTQ0NTQ3MDI5.jXo7XTvN6D6R3kwW5ZI7N40MQnOhNAszWbvOcfqhWOgg.Y2ZStGCrvIqH4uoanG7xT7jJ40lZuLjLYaCH2e5uU-4g.JPEG/43176289668034504f7ff4c7e-fb26-4c65-b049-153cc3f83983.jpg?type=s156_webp",
  },
  {
    dest: "artists/top-196.webp",
    url: "https://phinf.wevpstatic.net/MjAyNDA5MTlfMTcg/MDAxNzI2NzQzMDIxMDIy.G0iE3k0PDexfJYE4Jy5f8R2wGG4PNcGgLHwom-iDLmIg.a_p4EH7twI_CWXE1DqK2RBp-yq1NLcpkDeymtMikLNcg.JPEG/b58d8e74-32db-4411-8607-c6bb347c0d7f.jpeg?type=s156_webp",
  },
  {
    dest: "artists/top-197.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMTJfMTEg/MDAxNzkxNzg1MTgyNzI3.NqgzqN3J7Ia16GhPrRoK67x7__oYEQEp3DAyXhJSsIYg.pn6Ke9Q6fy5iMtMap66VEBPkoCc9u-U0LiAVT7J5QkQg.PNG/c25559b8-2015-458e-b059-7441b94db87f.png?type=s156_webp",
  },
  {
    dest: "artists/top-198.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTA3MDlfMjkz/MDAxNzUyMDE3ODMxMzAy.zK-M2fP80L5qzpSyKnHripo7k3OFu_7NfOIb6Q3rVVkg.WYchhuCX51-JB_SgvvGsT-RG8uB8aFlF8izEGpDdQLgg.JPEG/43ae275b-f560-4035-9935-13bbbf3bc5d5.jpeg?type=s156_webp",
  },
  {
    dest: "artists/top-199.webp",
    url: "https://phinf.wevpstatic.net/MjAyNDA5MTlfMTA3/MDAxNzI2NzM5MzU0OTg0.deMbKneJdqg33SVwW9uhvL-fAfIm-7vb2G_3UM8Per0g.8_X0ZVZg132jefvCK8yS-LG7SVtjVzvPshvkHXH8w-Ag.JPEG/a80ee0c5-e567-4e05-89be-f800ade23af2.jpeg?type=s156_webp",
  },
  {
    dest: "artists/top-200.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMTFfMjgg/MDAxNzkxNzMwNjI1NDQw.QFspm-nj0gsyraYYXs59UJGGhidM3PqUgCaiwicIor4g.2GiPgtk1VgPdtF0RiPFp7JUbI-hpkif5rR6pHfdcdbog.JPEG/ea662120-43cf-4f7b-84cd-d57cff132f2c.jpeg?type=s156_webp",
  },
  {
    dest: "artists/top-201.webp",
    url: "https://phinf.wevpstatic.net/MjAyNDEwMTVfMTcw/MDAxNzI4OTc2MDY2MTk0.ZH3-mW6RomFDskGTnw6ilTUu2-xz_YUTG38-wUAl0ZMg.Va7cnGwbOEPfWJSX2YqXyKTQaceu378UMORMM5Fb3qQg.PNG/10401481381772072d37655cc-860d-4179-8736-457e844ddcbb.png?type=s156_webp",
  },
  {
    dest: "artists/top-202.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA1MzFfNjAg/MDAxNzgwMjM1ODk4Nzcw.E1RrHBnWHG5hHuXZmBg747PND8vTOoy_J66M1gH3yFMg.6L3AI7_pQV6Vu0LwBaq4B2yboqDZOxhPsWXFm5QbZQcg.JPEG/42fa9a7c-8af5-46e2-bb01-aeda7d889075.jpeg?type=s156_webp",
  },
  {
    dest: "artists/top-203.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA4MTRfMTIx/MDAxNzg2NjM1NjU4ODcz.15C_yIRvqWar2m7qRPc2d5ALAoX9Jwj4-8P6qECHw6gg.76eMNvZdOf6g6yN70CkUDf06_gCMK41vZ3PiyXYVXrEg.JPEG/528d5c9d-a7f5-4c32-9e01-1643e4922d48.jpeg?type=s156_webp",
  },

  // 8 Reload-#2 Paired Featured Artists (reqid 1249..1264: Kep1er, ILLIT, HYOLYN, SEVENTEEN, LEE JUNHO, HANBIN, BAEKHO, AHN HYO SEOP)
  {
    dest: "artists/kep1er-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjAzMDlfNCAg/MDAxNzcyOTgyNTU1MDM3.lbrP60YjlzxH21Vpi-_163qPfFLziX9iMSnc-4LSLMYg.VtH1VvbfWe6CVoVOjTJzOianBrU0Q_4_iNH0d27_5Pgg.JPEG/be80844d-264d-4db1-8359-dbd8ca45382b.jpeg?type=s156_webp",
  },
  {
    dest: "artists/kep1er-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA5MjhfMTkz/MDAxNzkwNTYwMDI4NDY3.knbSm7JNA60HcgFKVweX2iKIE_UwOFQNdjkqHPaiil0g.TQHQgEe8Kd0MTwFILq6jLBIeGnDmvamjZs-76aH7RUEg.JPEG/0d6e0819-e188-48df-b169-24e018ea4390.jpeg?type=s156_webp",
  },
  {
    dest: "artists/illit-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTdfNTQg/MDAxNzk0ODkxMDA3OTE5.u5Bdh9FwUGjoAzYaOqmeSt97LK2Z3IByCCWMshIhq7Ug.HPzTH1H5W3EycsXm0EdccvWBNrpHTIxvUwCqaI0Wq2Mg.PNG/748ed5ac-527f-463f-94b8-754fb64d1e16.png?type=s156_webp",
  },
  {
    dest: "artists/illit-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA5MjJfMjkw/MDAxNzkwMDg4Njc5Njk1.jl5hxaCLsMCaOqkKy2ZIzP1Spk1-pVWbRivFIQq4FnUg.eOQ6-6PUt0ZOc106z-J94x5Kwk7HSqQ0Y3Mqbz9rpf4g.JPEG/a7893b80-b461-4ce5-a988-f3a502e46cc4.jpeg?type=s156_webp",
  },
  {
    dest: "artists/hyolyn-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjAzMjBfMTEx/MDAxNzczOTcyMzExNTgx.C9S8Q3oozruE16HlgSQ6LeofoNDYdA0YCAfYs3SEuKog.qaoKvN6y2VUMvnUPEjAlvzKGH8m5JUG-8nOy3uIn4AQg.PNG/c691b8c1-d707-47d8-b9a9-c641941f10a1.png?type=s156_webp",
  },
  {
    dest: "artists/hyolyn-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMTVfODkg/MDAxNzkyMDYxODI2OTQy.Tmh1bcF_Xcm23D6yO4PMagTqkpVNq00b2QheFbymwnMg.hHOv6ssezZ1GD12OvuH_dbiX8p8szYF1posJUpjO7BMg.JPEG/5e96c1c4-26fe-4bb0-b07f-5975bb0925f2.jpeg?type=s156_webp",
  },
  {
    dest: "artists/seventeen-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA3MTVfMjY1/MDAxNzg0MTEyODQzMTg3.1zjpP9hfPzqyolP2qC8NhQWJvYp4fmhGMxVbHKdAa8Ig.IsC3rK7drSY6ZQ1EwobYFjk7yqagXsMqHKxFpwPegM8g.PNG/0ebc77ad-b7d9-404e-b20d-82c31067735c.png?type=s156_webp",
  },
  {
    dest: "artists/seventeen-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA5MjJfMjc2/MDAxNzkwMDg4NzM1MzM3.lFsevjPKQxFiagz9XGUB7zNI3QYhnCBeET90pSGANDkg.5X5RdqIw7gzof7OCGBauz7JYSchpvGuxDEKZZXMNVHwg.JPEG/64d0ff48-fc87-4835-be5b-0cfc0093b836.jpeg?type=s156_webp",
  },
  {
    dest: "artists/leejunho-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTA4MTVfNDcg/MDAxNzU1MTg3NTA0Mzk0.5_Gz4xoIH8FEOhMuUU4tEi9anWBDDD_ZuTLl4JQtbiwg.CxxsKH-X18yiTa-FUDIdekNLtt5eHYmp7aInjqSMt7Eg.JPEG/c1df0258-b9ea-41cd-8410-8fde0ec54b12.jpeg?type=s156_webp",
  },
  {
    dest: "artists/leejunho-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTA4MTVfNDAg/MDAxNzU1MTg3MDI0MTUz.lmphYG8yQeTFyuMHGHwOcjEFxBnXS0drJkKQUgBQ3P4g.3QIbE_OW_WbvloMlwdtX0RR7BvtcnvhWpDDf0cd8SHsg.JPEG/48450a4a-2c47-456e-b543-3c10e0dfb60a.jpeg?type=s156_webp",
  },
  {
    dest: "artists/hanbin-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTJfMTM0/MDAxNzk0NDU1MDA2ODEw.JIaQ4l4E52Drvmj2iLvyU8eZ4-al61BzpLnzWQQFjAsg.ONpnhLQf4PgYJz5Fbkl6F6xa3u_Awjv7f6dajP9aIkYg.JPEG/741b1eb6-d3c7-4b1e-96c0-e4ed81579a38.jpeg?type=s156_webp",
  },
  {
    dest: "artists/hanbin-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjExMTJfMTE0/MDAxNzk0NDU5Nzk2MjQ5.JFQSov_7AWJwMmNRTjJ3iiK9VCKiFo9WWDzE5go_LUog.5PxhDhNLcCc7d54xkJiD86xKkYGrDhlp6nXVO_VBNHIg.JPEG/4c044eaf-df30-4b94-89ef-2d35670d42f9.jpeg?type=s156_webp",
  },
  {
    dest: "artists/baekho-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTA2MjdfMTEz/MDAxNzUxMDA5MDExNzg0.5BbxJx_qG3T0eQotULBYkp-t19RAW5qlEVv9Gh9j_7Ig.GgV_vtu9ZpcHWtMEW-8OI4e4yfZ6H8hBvuI-3mwtUcIg.PNG/6c53a102-2b56-447e-a51c-2621867846b9.png?type=s156_webp",
  },
  {
    dest: "artists/baekho-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTA2MjdfMTk3/MDAxNzUxMDA4OTk0NzUy.GuhwzwhKZtgdhxdWYViP4_Vz5EtRT5n_jA7-47ZqIrog.X8FEXZ11fEYhAFK2A8NHIPCuG4X4LAVTsLPco9h3H2Ag.PNG/0d57e507-7b7e-4efc-8a1b-0699caf81204.png?type=s156_webp",
  },
  {
    dest: "artists/ahnhyoseop-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA2MDRfMTQy/MDAxNzgwNTM4ODIxNzc0.nFaME9vzfwu42CQAFjeTF0oIdM2lCDt03--qMnGVUQUg.1JUr2FTM_0aAtg9xWtR9RsEF1Yv3PzZs3UrtOWrbsXUg.JPEG/d9ca0131-db2f-4615-ab20-1e9d7bc99256.jpeg?type=s156_webp",
  },
  {
    dest: "artists/ahnhyoseop-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA2MDNfMTI1/MDAxNzgwNDQwMTM3MTkx.jvjOvfVslHK-YA_iHFMGAqlD3sNCYDKKbxvveP3ptjAg._wu9RzPjZAUM8P156uV4jGSM6ZssTVM050Nc7FjW90wg.JPEG/4d5f067b-f7dc-45a8-a9fa-cf5c7b2c0adb.jpeg?type=s156_webp",
  },

  // 15 Exact JSON-Paired Featured Artists from home/v1.1/home
  {
    dest: "artists/leechaemin-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTA5MTJfMTIw/MDAxNzU3NjYxODAyMzEz.G7uoZq5ts_eigGJiTGAQGlOJfsn_4XGCsDykYV8Slskg.oN0u5qFK22zRgW2DaNE_DIyZPaFWieLxtuJzhZQoLrUg.JPEG/cf286f57-3dc2-491c-98df-a27dbc0021e9.jpg?type=s156_webp",
  },
  {
    dest: "artists/leechaemin-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTA5MTJfMjA0/MDAxNzU3NjYxODAyMjcx.ksZVO-xEzZZKTcWvU-6FYATHssHOIryenZe0lRNZPQIg.jk0xrvr3aTrmXO63NXdKeCjmasjj6xpqsajPsexj4_cg.JPEG/24d7ce63-c1a4-41dc-a6ec-217e451ac70d.jpg?type=s156_webp",
  },
  {
    dest: "artists/owis-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjAxMTBfODAg/MDAxNzY4MDIyNzY3OTgx.7aGOyBuXVNj5Mzpp0RH53DfcahdTxmQ5TDTYCK2zP_Yg.tdjT_cjnVnTjOQZr0JerwVuihIb4cdAMw6Gh0DVyFkgg.JPEG/1a306c39-c0e6-4b16-9615-1170fbd2404a.jpg?type=s156_webp",
  },
  {
    dest: "artists/owis-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjAxMTBfMTEy/MDAxNzY4MDIyNzY3ODA5.QFeUlY-DScnPXLW4aZUviMrMGLFBLo867-MtdcDhSlsg.e8KKGa1caHphpJ81SsUobprT5VhPWNhB8nlUD-i0xXQg.JPEG/3b771364-758b-4438-af39-2b5888e37bda.jpg?type=s156_webp",
  },
  {
    dest: "artists/noa_aburasoba-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTA4MDZfMTk2/MDAxNzU0NDYyNTUzMjM3.N8O2LojuzZctn9fRYt7ElPZ-nQT_EkIc1uxtruFp_RUg.GGvoFjKu4pBMCTG1ZF9uscFu8DWP6FpvMV4ySEQOVsgg.PNG/24904b71-f3b1-4132-9322-ae219269fcee.png?type=s156_webp",
  },
  {
    dest: "artists/noa_aburasoba-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTA4MjFfODUg/MDAxNzU1Nzc2NTIzODAw.H3sc4dOOywtQNgJHK0noOGmd56UCDz0s1D6-_y1kJbkg.6Pf4-TvGZk_BrDGraQgsu2vqgN4_SJesIeIx412Js9Yg.PNG/39e59052-3619-4f56-94d6-ffb66d1be0e4.png?type=s156_webp",
  },
  {
    dest: "artists/fifthharmony-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTA4MzBfMjQ2/MDAxNzU2NTIzNDY2NjM1.fsE9CWPjNItst-T-mqo5m5PrHH5XNpGaYLSDJLM1oycg.khc-an2PUF_oFhU-C5LZA7eZO05zubeFV-JoRRKsQCsg.PNG/b29cf5a8-7cda-4b24-8949-18b61481c912.png?type=s156_webp",
  },
  {
    dest: "artists/fifthharmony-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTA4MzFfNjUg/MDAxNzU2NTk4MTY3NDcz.LPqia0Xju5e80qlHmXL5WCaOkJjYYoTihMe_665CyH8g.PFsATP6iAjrnOdFBVkSVh0PmX7jn7uXGgNXbTjSasaIg.PNG/88f405fb-feaa-4a33-ace3-7385ee3d1cd5.png?type=s156_webp",
  },
  {
    dest: "artists/akmu-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjAzMzFfNjEg/MDAxNzc0OTM5ODU5MTgz.mJeb5Og12GStRibNsbrsBz5uMYu4an7tx2oR6774R7cg.JieDt91bD9j0i8jAxrUvcugGZksmDd9bnd8PFDNfn4kg.JPEG/e92c978e-509d-469f-b4d8-85dca918ca2b.jpeg?type=s156_webp",
  },
  {
    dest: "artists/akmu-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA0MDFfMjky/MDAxNzc1MDE5MTEyMDMy.t_4Z014F7tMwOxCeLYMTrV0INRx7fiF4A-XP7BXHmVIg.QG9a1f_U-8ZsR9exTfErFspXNhrSpf9iy8s5t4yIqxkg.JPEG/d11b8c2d-61cb-492c-902f-8ced6bf45a2b.jpeg?type=s156_webp",
  },
  {
    dest: "artists/bibi-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA1MjJfMjQ1/MDAxNzc5NDE2MTk2ODUz.xVqy0rRzyBkwaIs4ZzEIiL6UrKSxI-PovXluoU1uWzMg.KRncw64kgH9GnRh2ODr0uLKGSm9QROHzRZHc1kI6K5kg.PNG/362d3355-7539-42ba-97a1-66d23984e396.png?type=s156_webp",
  },
  {
    dest: "artists/bibi-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNDA0MTFfMTE1/MDAxNzEyODIwOTAyMDY0.aWceA14Ra7QUxfnI8IfIsrYlja8gJ1w--g88qAXsKSQg.ln2jfDPNJAPsxHjY4Pe3Mjgp7uSDJf_rgAf3QTlA4BQg.PNG/307741302044910d4686814-3c02-45fa-afe7-39c59a95f445.png?type=s156_webp",
  },
  {
    dest: "artists/kimwoobin-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjAxMTVfMjEy/MDAxNzY4NDA2NzY0NDI0.ovB92IjvMDmFHPmDXlBRrSqxRprkxVPtoHtbXnN6HsYg.l66qcz80TKwcUKvesEB6q_ung2QvgTwYk45nKO1AEWEg.JPEG/9a81f0eb-9445-411f-a4a2-81040acb5378.jpg?type=s156_webp",
  },
  {
    dest: "artists/kimwoobin-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjAxMTVfMTU4/MDAxNzY4NDA2MDM5Nzgw.e07f5sTCl40EdraG64UhzrCQA8AO8kOu4WrkeMbR6IYg.Jy0vKVoY_kiru8nBQb6NKyWGXWlMzstwpM2dV2gEm6Qg.JPEG/cdc23c78-2e8c-4930-b5ff-6713cefbdc13.jpg?type=s156_webp",
  },
  {
    dest: "artists/3skm-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA4MDZfNjQg/MDAxNzg2MDA2MDc2MDY5.Azp0ZiIVtIl8suiPA2yG0m9uV-MtSJgb7EHHLuW05isg.207WhioIwNFw3MpwJyT89YtXnO53G4g_ZEvzZ2tf2kcg.PNG/89aacec0-8222-4e7a-a580-6d56b10fc458.png?type=s156_webp",
  },
  {
    dest: "artists/3skm-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA4MDZfMTQ0/MDAxNzg2MDA2MDc2MDU2.0r4-2jFOiYTSxtfh17PWiRN6YbWaWo5z5DONScw6FR8g.utYHfS6M5-bMluhuJwZr1TAZdTZvMSmqp6K1MZm4NN4g.PNG/1ed7459e-2979-4b97-a551-76f613a089d3.png?type=s156_webp",
  },
  {
    dest: "artists/eric-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA5MTZfNzMg/MDAxNzg5NTQxMDkyMjc5.BdeMTn03AdOPXKfY89kfhkiswesKCIt_EJ4FtFNiHLMg.pzYYbgzrs-qXlHFa3Z08b1Ujjt9B0z24Ze64NkicaDwg.JPEG/504d1731-34ad-47af-ac80-4002acb643ba.jpg?type=s156_webp",
  },
  {
    dest: "artists/eric-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA5MTBfMTAg/MDAxNzg5MDQ0ODcyMDUx.3RuFGDfrXHTmhp0HjMxNuJDLep3Q-UoavL1qIYCrM_4g.YBhP98wb80YiBBcz08H_phjG5IxDCCmV9nJy-M4U2YIg.JPEG/0ed6e73a-a560-4bde-95e0-b81adb233722.jpg?type=s156_webp",
  },
  {
    dest: "artists/redvelvet-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA4MDNfMjM4/MDAxNzg1NzUxNDg3MTQy.cHJzmFzYxDdzNnFcA8eGokYgjO9XgMxEjnqWhq-jS_Qg.47V5V8I1DvRYcZklYm3gaCTem4J255u5GGoM2pLQ_pEg.JPEG/b1c22691-f635-43b7-8977-cf864a0c5909.jpeg?type=s156_webp",
  },
  {
    dest: "artists/redvelvet-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyMzA4MjlfOTkg/MDAxNjkzMjg3ODA5NDk1.NigPqiICgciGa3lKi-O_SzggclUoBr_9sCbHpWmAqpIg.kKryUcElolNsgIcOv7OPFZTrr_jP90yqaJ5Zlz9c_iwg.JPEG/777726795482744574fbb8899-7875-4609-b794-619785b4293d.jpg?type=s156_webp",
  },
  {
    dest: "artists/adap-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjEwMDFfMTE1/MDAxNzkwODM1NDA5OTg4.R1NIK7d_sM7ag3uCXFfERZruEZ9Cu3NcO70rcqJjt3cg.zkcJlWOTjgGZ5FmZC9-ocOSiXA8Ws68pjT_8WQEVsO8g.JPEG/8b7667c2-bc25-421e-aadd-719543088031.jpeg?type=s156_webp",
  },
  {
    dest: "artists/adap-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA4MThfOSAg/MDAxNzg3MDM2NzE2MTM1.8Ia9yBesPJQqFHlMDuRvf6VvImAOihtGFqFchuo4JH4g.nj8JrSG8gKnS0I6tsyGIQmJ3cFc_Sp48K7dDci0zlxYg.JPEG/5945eadf-745c-4908-bf6c-247703d9cf05.jpg?type=s156_webp",
  },
  {
    dest: "artists/katseye-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA2MTdfMTU1/MDAxNzgxNjI0ODY2NDUx.OGJLHVnuq6qFIdTWMO6qTsWvcgthRj9LF9mrqrWY_PQg.ZkjlDHiK3us9tm4rp4Ax2ElptbzK9gsc2gvOzxabSwEg.JPEG/75ec28e5-9f83-4320-8ddd-3c1fc98dcc52.jpeg?type=s156_webp",
  },
  {
    dest: "artists/katseye-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA3MThfMjc4/MDAxNzg0MzAzOTc3NTkz.58iYNesxy6tzoUk88MPoqIqPeDbJ--0o_so0j_xuEHUg.bwV1VBwcHJ3QWO66N9OpvX4guYJcUxbmomb7EdjBGqcg.PNG/0a264dd9-8735-4750-9ede-4a9c2d1d824a.png?type=s156_webp",
  },
  {
    dest: "artists/ahnbohyun-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTEyMjZfMjUz/MDAxNzY2NzE3NzQyMDE5.Fpqlu13N9WMdMUTBmHDVDZ15MyGd647KF5U_GUUXINwg.1zv1qpYeVW5eWCNCzSsq2_IL-JHhvML2Xcemic0tQowg.JPEG/d79680d8-b1f2-4639-86c3-b270db6e9b24.jpeg?type=s156_webp",
  },
  {
    dest: "artists/ahnbohyun-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNTEyMjZfMTgg/MDAxNzY2NzE3NzA1MDQ0.Cw3cp8NNuPkcsqIYA2OeB1wuPV0_f-yCk5-bvW43oUcg.bSDWKxZc6gvZN9p3p3oR4ugsedvMrRIQJEHNXB4nGsAg.JPEG/48712c4c-df51-4684-90c1-6de2d7cd439d.jpeg?type=s156_webp",
  },
  {
    dest: "artists/wheein-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA0MDdfMTg2/MDAxNzc1NTUwMDcwNzEw.Rxbc6zgbwXEkRGYdObuIuh0w4GMMWgMZu6XKDt0ywOUg.laFinZMVXUs3BupiHfBN_nA-UVRI20f61noW0UEUeTcg.JPEG/3667f469-8958-46ea-9a4f-442b3016fde5.jpeg?type=s156_webp",
  },
  {
    dest: "artists/wheein-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNjA0MDdfMzgg/MDAxNzc1NTUwMDQ0OTQ4.4fO7EtXrSWjfAw43iqG99Zgc6By6RJ_pP-uFYd3XxhYg.xBEMKMD0FC-BH7CzyErYHsWaIA-cdFlnba0Oa06icCwg.JPEG/81110e21-532d-437d-8393-5f829c41da2c.jpeg?type=s156_webp",
  },
  {
    dest: "artists/hongseok-header.webp",
    url: "https://phinf.wevpstatic.net/MjAyNDA0MjNfMTIw/MDAxNzEzODU1NzcwMTU0.xxWYuzICgo3ODsbMQti3RpCU5Z68L8TXzhsJOaSGnCAg.6l5g1f5zAMxEYOB-J6BuW-wClPbVGzolNhM45c18xTYg.PNG/4699210911003315910338e61-6ea5-4b0d-a281-80787cb98f6d.png?type=s156_webp",
  },
  {
    dest: "artists/hongseok-logo.webp",
    url: "https://phinf.wevpstatic.net/MjAyNDA0MjNfMjUg/MDAxNzEzODUyNjU5NDY5.Wjsuid81in91pDbKj1mTzugLgAX_Cz0jA-PbdFw0nTQg.Wtl_c4bAV9bqzsesWpnl-ybVFQUGV0nj-fcvvRql1f8g.JPEG/277219366588041877a1fc43f-a9e6-415c-9e6f-ac5fe335cf2c.jpg?type=s156_webp",
  },
];

async function downloadFile(url, destPath) {
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100) {
    throw new Error(`Suspiciously small payload (${buf.length}B) for ${url}`);
  }
  await fs.writeFile(destPath, buf);
  return { bytes: buf.length, contentType: res.headers.get("content-type") || "" };
}

async function downloadPretendardSubsets() {
  const fontCssUrl =
    "https://cdn-v2pstatic.weverse.io/wev_web_fe/assets/fonts/pretendard/latest/font.css";
  const res = await fetch(fontCssUrl, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`Failed to fetch Pretendard CSS: HTTP ${res.status}`);
  }
  const css = await res.text();
  const blocks = css.match(/@font-face\s*\{[^}]+\}/g) || [];
  const wantedWeights = new Set(["300", "400", "500", "700", "800"]);
  // Latin + punctuation + numbers + symbols live in subsets 70..118 of Pretendard v1.3.9;
  // check unicode-range to keep every subset that covers ASCII/Latin (U+0000-02FF, U+2000-206F) plus observed subsets 71..91.
  const keepSubsetNumbers = new Set();
  const parsed = [];

  for (const block of blocks) {
    const weightMatch = block.match(/font-weight:\s*(\d+)/);
    const woff2Match = block.match(
      /url\((https:\/\/[^)]+\/(Pretendard-[A-Za-z]+\.subset\.(\d+)\.woff2))\)/
    );
    const rangeMatch = block.match(/unicode-range:\s*([^;]+);/);
    if (!weightMatch || !woff2Match || !rangeMatch) continue;
    const weight = weightMatch[1];
    if (!wantedWeights.has(weight)) continue;
    const url = woff2Match[1];
    const filename = woff2Match[2];
    const subsetNum = Number(woff2Match[3]);
    const range = rangeMatch[1].trim();

    // Keep subsets >= 70 (Latin, punctuation, numerals, diacritics, common symbols)
    // and check if it includes Latin characters (U+00.. or U+20.. or U+01..)
    const hasLatinOrSymbol =
      subsetNum >= 71 ||
      /U\+00[0-9a-f]{2}|U\+20[0-9a-f]{2}|U\+01[0-9a-f]{2}/i.test(range);
    if (hasLatinOrSymbol) {
      keepSubsetNumbers.add(subsetNum);
      parsed.push({ weight, url, filename, range, subsetNum });
    }
  }

  console.log(
    `Downloading ${parsed.length} Pretendard v1.3.9 woff2 subsets across weights 300/400/500/700/800...`
  );
  await fs.mkdir(FONTS_DIR, { recursive: true });

  const localBlocks = [];
  const BATCH = 12;
  for (let i = 0; i < parsed.length; i += BATCH) {
    const slice = parsed.slice(i, i + BATCH);
    await Promise.all(
      slice.map(async (item) => {
        const dest = path.join(FONTS_DIR, item.filename);
        await downloadFile(item.url, dest);
        localBlocks.push(
          `@font-face {\n  font-family: "Pretendard";\n  font-style: normal;\n  font-display: swap;\n  font-weight: ${item.weight};\n  src: url("/sites/weverse/fonts/${item.filename}") format("woff2");\n  unicode-range: ${item.range};\n}`
        );
      })
    );
  }

  const header = `/* Local Pretendard v1.3.9 dynamic subsets downloaded from Weverse CDN */\n`;
  await fs.writeFile(FONTS_CSS_OUT, header + localBlocks.join("\n") + "\n", "utf8");
  console.log(`Wrote ${localBlocks.length} @font-face rules to ${FONTS_CSS_OUT}`);
}

async function main() {
  console.log(`Downloading ${ASSETS.length} image assets into ${OUT_DIR}...`);
  let ok = 0;
  let totalBytes = 0;
  const failures = [];

  const BATCH = 10;
  for (let i = 0; i < ASSETS.length; i += BATCH) {
    const slice = ASSETS.slice(i, i + BATCH);
    await Promise.all(
      slice.map(async (item) => {
        try {
          const dest = path.join(OUT_DIR, item.dest);
          const { bytes, contentType } = await downloadFile(item.url, dest);
          ok += 1;
          totalBytes += bytes;
          if (!contentType.startsWith("image/")) {
            console.warn(`Warning: ${item.dest} returned content-type=${contentType}`);
          }
        } catch (err) {
          failures.push({ dest: item.dest, error: String(err) });
        }
      })
    );
  }

  console.log(`Images complete: ${ok}/${ASSETS.length} (${(totalBytes / 1024).toFixed(1)} KB)`);
  if (failures.length > 0) {
    console.error("Failures:", failures);
    process.exitCode = 1;
    return;
  }

  await downloadPretendardSubsets();
  console.log("All Weverse assets downloaded successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

