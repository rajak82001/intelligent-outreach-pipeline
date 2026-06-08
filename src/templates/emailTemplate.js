export function buildPersonalizedEmail(person) {
  const subject = `Quick idea for ${person.companyName}`;

  const htmlContent = `
    Hi ${person.firstName || person.fullName},

    I came across your profile while researching ${person.companyName}.

    I noticed your work in ${person.title || "leadership"} and thought you might be interested in a simple way to streamline lead discovery and outreach workflows.

    We've been exploring solutions that help teams save time on prospecting while maintaining a personalized approach.

    I'd love to get your thoughts if this sounds relevant to your team.

    Best regards,
    Raja Khan
  `;

  return {
    subject,
    htmlContent,
  };
}