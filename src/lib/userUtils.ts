// Função para extrair iniciais do primeiro e segundo nome
export const getInitials = (name?: string, email?: string): string => {
  if (name) {
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'US';
};

// Função para extrair primeiro e segundo nome
export const getDisplayName = (name?: string, email?: string): string => {
  if (name) {
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]}`;
    }
    return parts[0] || name;
  }
  if (email) {
    const localPart = email.split('@')[0];
    return localPart.charAt(0).toUpperCase() + localPart.slice(1).toLowerCase();
  }
  return 'Usuário';
};
