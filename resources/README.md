# Recursos do App FinanceX

## Gerando Ícones para Android e iOS

Após clonar o projeto do GitHub, execute os seguintes comandos para gerar automaticamente os ícones em todos os tamanhos necessários:

### 1. Instale as dependências
```bash
npm install
```

### 2. Gere os ícones
```bash
npx capacitor-assets generate --iconBackgroundColor '#0a0f1a' --iconBackgroundColorDark '#0a0f1a' --splashBackgroundColor '#0a0f1a' --splashBackgroundColorDark '#0a0f1a'
```

### 3. Sincronize com os projetos nativos
```bash
npx cap sync
```

## Arquivos de Origem

- `icon.png` - Ícone do app (recomendado: 1024x1024px)
- `splash.png` - Splash screen (opcional, recomendado: 2732x2732px)

## Tamanhos Gerados

### Android
- mipmap-mdpi: 48x48
- mipmap-hdpi: 72x72
- mipmap-xhdpi: 96x96
- mipmap-xxhdpi: 144x144
- mipmap-xxxhdpi: 192x192

### iOS
- 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024
- Em múltiplas densidades (@1x, @2x, @3x)
