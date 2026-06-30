# G20 Country Calibration Audit

**Note**: All `c1` and `alpha` parameters use engine defaults and are marked `ASSUMED`.
**Flag**: Phase 1 verification requires Frank's decision on §3 (credibility model). Please confirm if we are using option (a) cred=1.0 ceiling-only, or option (b) per-country initial cred + ceiling.

## Argentina
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 14.9 | 14.9% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=AR | 2024 | SOURCED |
| `T` | 10.4 | 10.4% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=AR | 2024 | SOURCED |
| `B` | 80.0 | 80.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | -0.013 | -1.3% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=AR | 2024 | SOURCED |
| `i_target` | 0.5000 | 50.0% | / 100 | https://tradingeconomics.com/argentina/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 2.1990 | 219.9% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=AR | 2024 | SOURCED |
| `m1` | 0.1270 | 12.7% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=AR | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 66.7 | 66.7% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=AR | 2024 | SOURCED |
| `theta` | 0.3 | - | Band: history of de-anchoring | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## Australia
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 22.1 | 22.1% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=AU | 2024 | SOURCED |
| `T` | 23.6 | 23.6% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=AU | 2022 | SOURCED |
| `B` | 50.0 | 50.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.014 | 1.4% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=AU | 2024 | SOURCED |
| `i_target` | 0.0435 | 4.35% | / 100 | https://tradingeconomics.com/australia/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0320 | 3.2% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=AU | 2024 | SOURCED |
| `m1` | 0.2250 | 22.5% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=AU | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 51.4 | 51.4% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=AU | 2024 | SOURCED |
| `theta` | 0.9 | - | Band: long-credible targeter | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## Brazil
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 18.8 | 18.8% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=BR | 2024 | SOURCED |
| `T` | 15.4 | 15.4% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=BR | 2024 | SOURCED |
| `B` | 75.0 | 75.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.034 | 3.4% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=BR | 2024 | SOURCED |
| `i_target` | 0.1050 | 10.5% | / 100 | https://tradingeconomics.com/brazil/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0440 | 4.4% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=BR | 2024 | SOURCED |
| `m1` | 0.1760 | 17.6% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=BR | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 64.0 | 64.0% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=BR | 2024 | SOURCED |
| `theta` | 0.5 | - | Band: newer/recently strained | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## Canada
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 20.9 | 20.9% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=CA | 2023 | SOURCED |
| `T` | 13.9 | 13.9% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=CA | 2024 | SOURCED |
| `B` | 105.0 | 105.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.016 | 1.6% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=CA | 2024 | SOURCED |
| `i_target` | 0.0475 | 4.75% | / 100 | https://tradingeconomics.com/canada/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0240 | 2.4% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=CA | 2024 | SOURCED |
| `m1` | 0.3270 | 32.7% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=CA | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 54.4 | 54.4% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=CA | 2023 | SOURCED |
| `theta` | 0.9 | - | Band: long-credible targeter | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## China
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 16.6 | 16.6% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=CN | 2024 | SOURCED |
| `T` | 7.0 | 7.0% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=CN | 2024 | SOURCED |
| `B` | 80.0 | 80.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.050 | 5.0% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=CN | 2024 | SOURCED |
| `i_target` | 0.0345 | 3.45% | / 100 | https://tradingeconomics.com/china/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0020 | 0.2% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=CN | 2024 | SOURCED |
| `m1` | 0.1720 | 17.2% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=CN | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 39.9 | 39.9% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=CN | 2024 | SOURCED |
| `theta` | 0.5 | - | Band: newer/recently strained | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## France
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 23.1 | 23.1% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=FR | 2023 | SOURCED |
| `T` | 22.8 | 22.8% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=FR | 2024 | SOURCED |
| `B` | 110.0 | 110.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.012 | 1.2% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=FR | 2024 | SOURCED |
| `i_target` | 0.0400 | 4.0% | / 100 | https://tradingeconomics.com/france/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0200 | 2.0% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=FR | 2024 | SOURCED |
| `m1` | 0.3420 | 34.2% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=FR | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 53.3 | 53.3% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=FR | 2023 | SOURCED |
| `theta` | 0.9 | - | Band: long-credible targeter | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## Germany
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 21.1 | 21.1% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=DE | 2023 | SOURCED |
| `T` | 10.9 | 10.9% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=DE | 2024 | SOURCED |
| `B` | 65.0 | 65.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | -0.005 | -0.5% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=DE | 2024 | SOURCED |
| `i_target` | 0.0400 | 4.0% | / 100 | https://tradingeconomics.com/germany/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0230 | 2.3% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=DE | 2024 | SOURCED |
| `m1` | 0.3770 | 37.7% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=DE | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 49.5 | 49.5% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=DE | 2023 | SOURCED |
| `theta` | 0.9 | - | Band: long-credible targeter | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## India
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 10.0 | 10.0% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=IN | 2024 | SOURCED |
| `T` | 6.7 | 6.7% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=IN | 2022 | SOURCED |
| `B` | 80.0 | 80.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.065 | 6.5% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=IN | 2024 | SOURCED |
| `i_target` | 0.0650 | 6.5% | / 100 | https://tradingeconomics.com/india/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0500 | 5.0% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=IN | 2024 | SOURCED |
| `m1` | 0.2350 | 23.5% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=IN | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 61.4 | 61.4% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=IN | 2024 | SOURCED |
| `theta` | 0.5 | - | Band: newer/recently strained | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## Indonesia
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 7.7 | 7.7% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=ID | 2024 | SOURCED |
| `T` | 7.7 | 7.7% | Assumed = G | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=ID | 2024 | ASSUMED |
| `B` | 40.0 | 40.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.050 | 5.0% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=ID | 2024 | SOURCED |
| `i_target` | 0.0625 | 6.25% | / 100 | https://tradingeconomics.com/indonesia/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0220 | 2.2% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=ID | 2024 | SOURCED |
| `m1` | 0.2040 | 20.4% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=ID | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 55.4 | 55.4% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=ID | 2024 | SOURCED |
| `theta` | 0.5 | - | Band: newer/recently strained | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## Italy
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 17.7 | 17.7% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=IT | 2023 | SOURCED |
| `T` | 25.6 | 25.6% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=IT | 2024 | SOURCED |
| `B` | 140.0 | 140.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.007 | 0.7% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=IT | 2024 | SOURCED |
| `i_target` | 0.0400 | 4.0% | / 100 | https://tradingeconomics.com/italy/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0100 | 1.0% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=IT | 2024 | SOURCED |
| `m1` | 0.3030 | 30.3% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=IT | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 58.0 | 58.0% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=IT | 2023 | SOURCED |
| `theta` | 0.9 | - | Band: long-credible targeter | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## Japan
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 21.6 | 21.6% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=JP | 2022 | SOURCED |
| `T` | 21.6 | 21.6% | Assumed = G | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=JP | 2022 | ASSUMED |
| `B` | 250.0 | 250.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.001 | 0.1% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=JP | 2024 | SOURCED |
| `i_target` | 0.0025 | 0.25% | / 100 | https://tradingeconomics.com/japan/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0270 | 2.7% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=JP | 2024 | SOURCED |
| `m1` | 0.2360 | 23.6% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=JP | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 55.5 | 55.5% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=JP | 2022 | SOURCED |
| `theta` | 0.9 | - | Band: long-credible targeter | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## Mexico
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 11.2 | 11.2% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=MX | 2024 | SOURCED |
| `T` | 14.6 | 14.6% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=MX | 2024 | SOURCED |
| `B` | 50.0 | 50.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.014 | 1.4% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=MX | 2024 | SOURCED |
| `i_target` | 0.1100 | 11.0% | / 100 | https://tradingeconomics.com/mexico/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0470 | 4.7% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=MX | 2024 | SOURCED |
| `m1` | 0.3790 | 37.9% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=MX | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 70.2 | 70.2% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=MX | 2024 | SOURCED |
| `theta` | 0.5 | - | Band: newer/recently strained | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## Russia
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 18.6 | 18.6% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=RU | 2024 | SOURCED |
| `T` | 10.9 | 10.9% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=RU | 2024 | SOURCED |
| `B` | 20.0 | 20.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.043 | 4.3% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=RU | 2024 | SOURCED |
| `i_target` | 0.1600 | 16.0% | / 100 | https://tradingeconomics.com/russia/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0840 | 8.4% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=RU | 2024 | SOURCED |
| `m1` | 0.1760 | 17.6% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=RU | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 49.4 | 49.4% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=RU | 2024 | SOURCED |
| `theta` | 0.3 | - | Band: history of de-anchoring | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## Saudi Arabia
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 21.3 | 21.3% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=SA | 2024 | SOURCED |
| `T` | 8.2 | 8.2% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=SA | 2024 | SOURCED |
| `B` | 25.0 | 25.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.020 | 2.0% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=SA | 2024 | SOURCED |
| `i_target` | 0.0600 | 6.0% | / 100 | https://tradingeconomics.com/saudi-arabia/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0170 | 1.7% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=SA | 2024 | SOURCED |
| `m1` | 0.2560 | 25.6% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=SA | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 44.9 | 44.9% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=SA | 2024 | SOURCED |
| `theta` | 0.9 | - | Band: long-credible targeter | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## South Africa
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 19.2 | 19.2% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=ZA | 2024 | SOURCED |
| `T` | 25.4 | 25.4% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=ZA | 2023 | SOURCED |
| `B` | 75.0 | 75.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.005 | 0.5% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=ZA | 2024 | SOURCED |
| `i_target` | 0.0825 | 8.25% | / 100 | https://tradingeconomics.com/south-africa/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0440 | 4.4% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=ZA | 2024 | SOURCED |
| `m1` | 0.2990 | 29.9% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=ZA | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 64.6 | 64.6% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=ZA | 2024 | SOURCED |
| `theta` | 0.5 | - | Band: newer/recently strained | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## South Korea
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 17.5 | 17.5% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=KR | 2024 | SOURCED |
| `T` | 14.6 | 14.6% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=KR | 2023 | SOURCED |
| `B` | 55.0 | 55.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.020 | 2.0% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=KR | 2024 | SOURCED |
| `i_target` | 0.0350 | 3.5% | / 100 | https://tradingeconomics.com/south-korea/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0230 | 2.3% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=KR | 2024 | SOURCED |
| `m1` | 0.4030 | 40.3% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=KR | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 48.5 | 48.5% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=KR | 2024 | SOURCED |
| `theta` | 0.7 | - | Band: established but tested | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## Turkey
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 14.5 | 14.5% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=TR | 2024 | SOURCED |
| `T` | 17.6 | 17.6% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=TR | 2024 | SOURCED |
| `B` | 35.0 | 35.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.033 | 3.3% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=TR | 2024 | SOURCED |
| `i_target` | 0.5000 | 50.0% | / 100 | https://tradingeconomics.com/turkey/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.5850 | 58.5% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=TR | 2024 | SOURCED |
| `m1` | 0.2700 | 27.0% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=TR | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 54.3 | 54.3% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=TR | 2024 | SOURCED |
| `theta` | 0.3 | - | Band: history of de-anchoring | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## United Kingdom
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 20.2 | 20.2% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=GB | 2023 | SOURCED |
| `T` | 27.0 | 27.0% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=GB | 2024 | SOURCED |
| `B` | 104.0 | 104.0% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.011 | 1.1% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=GB | 2024 | SOURCED |
| `i_target` | 0.0375 | 3.75% | / 100 | https://tradingeconomics.com/united-kingdom/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0330 | 3.3% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=GB | 2024 | SOURCED |
| `m1` | 0.3190 | 31.9% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=GB | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 60.4 | 60.4% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=GB | 2023 | SOURCED |
| `theta` | 0.7 | - | Band: established but tested | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

## United States
| engine_key | preset_value | raw_source_figure | transformation | source_URL | vintage_date | status |
|---|---|---|---|---|---|---|
| `G` | 13.9 | 13.9% | None | https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=US | 2022 | SOURCED |
| `T` | 11.0 | 11.0% | None | https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=US | 2024 | SOURCED |
| `B` | 125.8 | 125.8% | None | https://www.imf.org/en/Publications/WEO | 2026 | SOURCED |
| `g` | 0.028 | 2.8% | / 100 | https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=US | 2024 | SOURCED |
| `i_target` | 0.0362 | 3.625% | / 100 | https://tradingeconomics.com/united-states/interest-rate | 2026 | SOURCED |
| `i_star` | 0.03625 | 3.625% | US Fed Rate Proxy | https://www.federalreserve.gov/ | 2026 | SOURCED |
| `pi_e` | 0.0290 | 2.9% | / 100 | https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=US | 2024 | SOURCED |
| `m1` | 0.1430 | 14.3% | / 100 | https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=US | 2024 | SOURCED |
| `c1` | 0.5 | 0.5 | Engine default | - | - | ASSUMED |
| `alpha` | 0.3 | 0.3 | Engine default | - | - | ASSUMED |
| `c0` | 68.4 | 68.4% | None | https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=US | 2022 | SOURCED |
| `theta` | 0.7 | - | Band: established but tested | https://www.bis.org/publ/qtrpdf/r_qt2309c.htm | 2026 | JUDGED |

**Verdict**: CALIBRATED — >6 numeric fields sourced.

