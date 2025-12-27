# Recursos do App FinanceX

## Gerando Ícones e Splash Screen para Android e iOS

Após clonar o projeto do GitHub, execute os seguintes comandos para gerar automaticamente os ícones e splash screens em todos os tamanhos necessários:

### 1. Instale as dependências
```bash
npm install
```

### 2. Gere os ícones e splash screens
```bash
npx capacitor-assets generate --iconBackgroundColor '#0a0f1a' --iconBackgroundColorDark '#0a0f1a' --splashBackgroundColor '#0a0f1a' --splashBackgroundColorDark '#0a0f1a'
```

### 3. Sincronize com os projetos nativos
```bash
npx cap sync
```

## Arquivos de Origem

- `icon.png` - Ícone do app (1024x1024px)
- `splash.png` - Splash screen (1024x1024px)

## Tamanhos Gerados

### Android
**Ícones:**
- mipmap-mdpi: 48x48
- mipmap-hdpi: 72x72
- mipmap-xhdpi: 96x96
- mipmap-xxhdpi: 144x144
- mipmap-xxxhdpi: 192x192

**Splash Screens:**
- drawable-mdpi, drawable-hdpi, drawable-xhdpi, drawable-xxhdpi, drawable-xxxhdpi

### iOS
- 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024
- Em múltiplas densidades (@1x, @2x, @3x)
- LaunchScreen.storyboard configurado automaticamente
