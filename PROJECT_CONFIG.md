# Configuración del Proyecto

## Información General

**Nombre**: Sistema Solar Interactivo  
**Versión**: 2.0.0  
**Descripción**: Demostración educativa interactiva del sistema solar  
**Autor**: Tu Nombre  
**Licencia**: MIT  
**Repositorio**: https://github.com/tu-usuario/sistema-solar-interactivo  
**Homepage**: https://tu-dominio.com  
**Demo**: https://tu-dominio.com/demo  

## Tecnologías

### Frontend
- **React**: 18.3.1
- **TypeScript**: 5.6.2
- **Vite**: 6.4.3
- **Tailwind CSS**: 3.4.0

### Herramientas de Desarrollo
- **ESLint**: Para linting de código
- **Prettier**: Para formateo automático
- **Husky**: Para git hooks
- **lint-staged**: Para linting de archivos staged

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo (http://localhost:5173)
npm run build        # Compilar para producción
npm run preview      # Vista previa de producción

# Calidad de código
npm run lint         # Ejecutar ESLint
npm run format       # Formatear código con Prettier
npm run type-check   # Verificar tipos TypeScript

# Tests (futuro)
npm run test         # Ejecutar tests
npm run test:watch   # Ejecutar tests en modo watch
npm run test:coverage # Ejecutar tests con coverage
```

## Estructura de Directorios

```
sistema-solar-interactivo/
├── .github/                    # Configuración de GitHub
│   ├── ISSUE_TEMPLATE/        # Templates para issues
│   ├── pull_request_template.md
│   ├── FUNDING.yml
│   └── COMMUNITY.md
├── docs/                       # Documentación adicional
│   ├── ARCHITECTURE.md        # Arquitectura del proyecto
│   ├── DEVELOPMENT.md         # Guía de desarrollo
│   └── screenshots/           # Capturas de pantalla
├── public/                     # Archivos estáticos
├── src/                        # Código fuente
│   ├── App.tsx                # Componente principal
│   ├── data/
│   │   └── planets.ts         # Datos del sistema solar
│   ├── index.css              # Estilos globales
│   └── main.tsx               # Punto de entrada
├── .gitignore                 # Archivos ignorados por Git
├── CHANGELOG.md               # Historial de cambios
├── CODE_OF_CONDUCT.md         # Código de conducta
├── CONTRIBUTING.md            # Guía de contribución
├── LICENSE                    # Licencia MIT
├── README.md                  # Documentación principal
├── SECURITY.md                # Política de seguridad
├── index.html                 # HTML base
├── package.json               # Dependencias y scripts
├── tsconfig.json              # Configuración TypeScript
├── vite.config.ts             # Configuración Vite
└── tailwind.config.js         # Configuración Tailwind
```

## Dependencias

### Producción
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

### Desarrollo
```json
{
  "@types/react": "^18.3.12",
  "@types/react-dom": "^18.3.1",
  "@vitejs/plugin-react": "^4.3.4",
  "autoprefixer": "^10.4.20",
  "postcss": "^8.4.49",
  "tailwindcss": "^3.4.17",
  "typescript": "^5.6.2",
  "vite": "^6.4.3"
}
```

## Configuración de Entornos

### Desarrollo
```bash
# .env.development
VITE_APP_ENV=development
VITE_APP_API_URL=http://localhost:3000
```

### Producción
```bash
# .env.production
VITE_APP_ENV=production
VITE_APP_API_URL=https://api.tu-dominio.com
```

## Despliegue

### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Desplegar a producción
vercel --prod
```

### Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy

# Desplegar a producción
netlify deploy --prod
```

### GitHub Pages
```bash
# Instalar gh-pages
npm i -D gh-pages

# Agregar script a package.json
"deploy": "npm run build && gh-pages -d dist"

# Desplegar
npm run deploy
```

## Métricas y Monitoreo

### Performance
- **Lighthouse Score**: Objetivo > 90
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### Analytics
- Google Analytics (opcional)
- Plausible Analytics (privacidad-first)
- Custom event tracking

## CI/CD

### GitHub Actions
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

## Roadmap

### Versión 2.1.0 (Próxima)
- [ ] Agregar planetas enanos (Plutón, Ceres, Eris)
- [ ] Modo offline con Service Worker
- [ ] Compartir configuraciones via URL
- [ ] Exportar capturas de pantalla

### Versión 2.2.0
- [ ] Implementar Three.js para modo 3D
- [ ] Agregar sonidos espaciales
- [ ] Sistema de guardado de progreso
- [ ] Modo educativo para profesores

### Versión 3.0.0
- [ ] Realidad virtual (WebXR)
- [ ] Simulación de exoplanetas
- [ ] API pública para datos
- [ ] App móvil nativa

## Contacto

- **Email**: [tu@email.com]
- **Twitter**: [@tu_twitter]
- **Discord**: [Servidor de Discord]
- **Website**: [tu-website.com]

## Agradecimientos

- Datos planetarios de [NASA](https://www.nasa.gov/)
- Inspiración de [NASA Eyes](https://science.nasa.gov/eyes/)
- Comunidad de [React](https://react.dev/)
- Todos los contribuidores del proyecto

---

**Última actualización**: Enero 2024
