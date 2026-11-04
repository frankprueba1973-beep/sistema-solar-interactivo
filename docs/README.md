# 📚 Documentación

Bienvenido a la documentación del Sistema Solar Interactivo. Aquí encontrarás toda la información necesaria para usar, contribuir y entender el proyecto.

## 📖 Índice

### Para Usuarios

- **[README Principal](../README.md)** - Introducción y guía de inicio rápido
- **[CHANGELOG](../CHANGELOG.md)** - Historial de cambios y versiones
- **[SECURITY](../SECURITY.md)** - Política de seguridad

### Para Desarrolladores

- **[Guía de Desarrollo](DEVELOPMENT.md)** - Cómo configurar el entorno y trabajar con el código
- **[Arquitectura](ARCHITECTURE.md)** - Detalles técnicos y estructura del proyecto
- **[Guía de Contribución](../CONTRIBUTING.md)** - Cómo contribuir al proyecto

### Para la Comunidad

- **[Código de Conducta](../CODE_OF_CONDUCT.md)** - Normas de la comunidad
- **[Comunidad](../.github/COMMUNITY.md)** - Recursos y canales de comunicación
- **[Configuración del Proyecto](../PROJECT_CONFIG.md)** - Información general del proyecto

## 🚀 Inicio Rápido

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/sistema-solar-interactivo.git

# Entrar al directorio
cd sistema-solar-interactivo

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Comandos Principales

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Compilar para producción
npm run preview    # Vista previa de producción
npm run lint       # Verificar código
```

## 📚 Guías por Tema

### Exploración del Sistema Solar

Aprende a usar las características principales:

1. **Navegación básica**
   - Zoom con rueda del mouse
   - Paneo arrastrando el canvas
   - Selección de planetas con click
   - Seguimiento de planetas con doble-click

2. **Controles de simulación**
   - Play/Pausa con botón o barra espaciadora
   - Ajuste de velocidad (0.25x - 10x)
   - Reset de vista con tecla R

3. **Visualización**
   - Mostrar/ocultar órbitas (tecla O)
   - Mostrar/ocultar nombres (tecla L)
   - Mostrar/ocultar estelas (tecla T)
   - Mostrar/ocultar zona habitable (tecla H)

### Herramientas Interactivas

Descubre las herramientas disponibles:

1. **Calculadora de Peso**
   - Descubre tu peso en cada planeta
   - Compara gravedades
   - Aprende sobre diferencias gravitacionales

2. **Calculadora de Viaje**
   - Estima tiempo de viaje entre planetas
   - Ajusta velocidad de la nave
   - Compara con misiones reales

3. **Calculadora de Edad**
   - Tu edad en años planetarios
   - Días solares en cada planeta
   - Perspectiva temporal diferente

4. **Simulador de Gravedad**
   - Simula caída de objetos
   - Calcula tiempo y velocidad
   - Compara diferentes gravedades

### Misiones Espaciales

Explora las misiones de exploración:

- **Misiones activas**: Voyager, Juno, Perseverance, James Webb
- **Misiones históricas**: Cassini, MESSENGER, New Horizons
- **Timeline**: Desde Sputnik (1957) hasta Europa Clipper (2024)

### Quiz y Aprendizaje

Pon a prueba tus conocimientos:

- **15 preguntas** sobre el sistema solar
- **Explicaciones detalladas** para cada respuesta
- **Sistema de puntuación** y retroalimentación
- **Logros desbloqueables** por exploración

## 🎓 Recursos Educativos

### Datos Planetarios

Cada planeta incluye información completa:

- **Características físicas**: Radio, masa, densidad, gravedad
- **Órbita**: Distancia al Sol, período orbital, rotación
- **Atmósfera**: Composición y características
- **Lunas**: Número y datos interesantes
- **Exploración**: Misiones y descubrimientos
- **Datos curiosos**: 6 hechos interesantes por planeta

### Comparaciones

Compara planetas en diferentes métricas:

- Radio y tamaño
- Distancia al Sol
- Gravedad superficial
- Número de lunas
- Densidad

### Atajos de Teclado

| Tecla | Función |
|-------|---------|
| `Espacio` | Pausar/Reproducir |
| `↑` / `+` | Aumentar velocidad |
| `↓` / `-` | Reducir velocidad |
| `O` | Órbitas on/off |
| `L` | Nombres on/off |
| `T` | Estelas on/off |
| `H` | Zona habitable |
| `M` | Minimapa |
| `R` | Reset vista |
| `F` | Dejar de seguir |
| `Esc` | Cerrar panel |

## 🛠️ Para Desarrolladores

### Estructura del Código

```
src/
├── App.tsx              # Componente principal
├── data/
│   └── planets.ts       # Datos estáticos
├── index.css            # Estilos globales
└── main.tsx             # Punto de entrada
```

### Conceptos Clave

1. **Canvas API**: Renderizado 2D de alta performance
2. **RequestAnimationFrame**: Loop de animación sincronizado
3. **Delta Time**: Animaciones independientes de framerate
4. **Sistema de Cámara**: Zoom, paneo y seguimiento
5. **Gestión de Estado**: React hooks para UI

### Agregar Nuevas Características

Consulta la [Guía de Desarrollo](DEVELOPMENT.md) para:

- Agregar nuevos planetas
- Implementar nuevas herramientas
- Crear nuevos logros
- Mejorar el rendimiento
- Optimizar el renderizado

### Testing

Próximamente implementaremos:

- Tests unitarios con Jest
- Tests de componentes con React Testing Library
- Tests de integración
- Tests de rendimiento

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Consulta:

- **[Guía de Contribución](../CONTRIBUTING.md)** - Cómo contribuir
- **[Código de Conducta](../CODE_OF_CONDUCT.md)** - Normas de la comunidad
- **[Issues](https://github.com/tu-usuario/sistema-solar-interactivo/issues)** - Issues abiertos
- **[Discussions](https://github.com/tu-usuario/sistema-solar-interactivo/discussions)** - Discusiones

### Áreas Necesitadas

- 🐛 Corrección de bugs
- ✨ Nuevas características
- 📝 Mejora de documentación
- 🌍 Traducciones
- 🎨 Mejoras de diseño
- 🧪 Tests
- ⚡ Optimización de rendimiento

## 📞 Soporte

### ¿Necesitas ayuda?

1. **Revisa la documentación**: Consulta esta guía y el README
2. **Busca en issues**: Puede que alguien ya haya tenido el mismo problema
3. **Abre un issue**: Usa los templates disponibles
4. **Contacta directamente**: [tu@email.com]

### Reportar Problemas

- **Bugs**: Usa el template de bug report
- **Sugerencias**: Usa el template de feature request
- **Seguridad**: Consulta [SECURITY.md](../SECURITY.md)

## 🔗 Enlaces Útiles

### Documentación Oficial
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Canvas API](https://developer.mozilla.org/docs/Web/API/Canvas_API)

### Recursos Espaciales
- [NASA](https://www.nasa.gov/)
- [NASA Eyes](https://science.nasa.gov/eyes/)
- [Solar System Scope](https://www.solarsystemscope.com/)
- [Planetary Society](https://www.planetary.org/)

### Comunidad
- [GitHub Discussions](https://github.com/tu-usuario/sistema-solar-interactivo/discussions)
- [Twitter](https://twitter.com/tu_twitter)
- [Discord](https://discord.gg/tu-servidor)

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](../LICENSE) para más detalles.

---

**¿Encontraste algo que falta en la documentación?** [Abre un issue](https://github.com/tu-usuario/sistema-solar-interactivo/issues/new) o [contribuye](../CONTRIBUTING.md) directamente.

**Última actualización**: Enero 2024
