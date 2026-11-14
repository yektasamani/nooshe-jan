const DOMAIN_TYPOS: Record<string, string> = {
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.om": "gmail.com",
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "yahoo.co": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yaho.com": "yahoo.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "outlook.co": "outlook.com",
  "outlook.con": "outlook.com",
  "outlok.com": "outlook.com",
  "icloud.co": "icloud.com",
  "icloud.con": "icloud.com",
  "iclod.com": "icloud.com",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;

export function validateEmail(email: string): string | null {
  if (!email) return "Enter your email.";
  if (!EMAIL_PATTERN.test(email)) return "That doesn't look like a valid email.";

  const [local, domain] = email.split("@");
  const fix = DOMAIN_TYPOS[domain.toLowerCase()];
  if (fix) return `Did you mean ${local}@${fix}?`;

  return null;
}
