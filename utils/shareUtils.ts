// Utility functions for sharing content

export const shareOnTwitter = (title: string, url: string) => {
  const text = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank', 'width=550,height=420');
};

export const shareOnLinkedIn = (url: string) => {
  const shareUrl = encodeURIComponent(url);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank', 'width=550,height=420');
};

export const shareOnFacebook = (url: string) => {
  const shareUrl = encodeURIComponent(url);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank', 'width=550,height=420');
};

export const shareOnWhatsApp = (title: string, url: string) => {
  const text = encodeURIComponent(`${title} - ${url}`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
};

export const copyToClipboard = async (url: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

export const generateSlug = (title: string, id: number): string => {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();

  return `${slug}-${id}`;
};

export const getIdFromSlug = (slug: string): number | null => {
  const parts = slug.split('-');
  const id = parseInt(parts[parts.length - 1]);
  return isNaN(id) ? null : id;
};
