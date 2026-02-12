# 🎨 Design System - Tuicial

## Identidade Visual

### Cores Principais

#### Azul Ciano Vibrante (#00A8E8)
- **Uso**: Botões primários, links, elementos interativos
- **Significado**: Tecnologia, confiança, profissionalismo
- **Aplicação**: Ações principais, CTAs, navegação ativa

#### Verde Limão (#A4D233)
- **Uso**: Botões secundários, badges de sucesso, destaques
- **Significado**: Crescimento, inovação, energia
- **Aplicação**: Status positivos, confirmações, elementos de destaque

### Paleta Completa

```css
/* Cores Primárias */
--primary: #00A8E8 (Azul Ciano)
--secondary: #A4D233 (Verde Limão)

/* Cores de Suporte */
--success: #10B981 (Verde)
--warning: #F59E0B (Laranja)
--error: #EF4444 (Vermelho)
--info: #3B82F6 (Azul)

/* Neutros */
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-300: #D1D5DB
--gray-400: #9CA3AF
--gray-500: #6B7280
--gray-600: #4B5563
--gray-700: #374151
--gray-800: #1F2937
--gray-900: #111827
```

## Tipografia

### Fonte Principal
**SN Pro** - Moderna, limpa e profissional

```css
--font-sans: "SN Pro", sans-serif;
```

### Hierarquia de Tamanhos

```css
/* Títulos */
h1: 2rem (32px) - Páginas principais
h2: 1.5rem (24px) - Seções
h3: 1.25rem (20px) - Subsecções
h4: 1.125rem (18px) - Cards

/* Corpo */
body: 1rem (16px) - Texto padrão
small: 0.875rem (14px) - Legendas
xs: 0.75rem (12px) - Labels
```

## Espaçamento

### Sistema de 8px

```css
--space-1: 0.25rem (4px)
--space-2: 0.5rem (8px)
--space-3: 0.75rem (12px)
--space-4: 1rem (16px)
--space-5: 1.25rem (20px)
--space-6: 1.5rem (24px)
--space-8: 2rem (32px)
--space-10: 2.5rem (40px)
--space-12: 3rem (48px)
--space-16: 4rem (64px)
```

## Bordas e Sombras

### Border Radius

```css
--radius-sm: 0.375rem (6px)
--radius-md: 0.5rem (8px)
--radius-lg: 0.75rem (12px) - Padrão
--radius-xl: 1rem (16px)
--radius-2xl: 1.5rem (24px)
--radius-full: 9999px
```

### Sombras

```css
/* Elevação Sutil */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)

/* Elevação Média */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)

/* Elevação Alta */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)

/* Elevação Dramática */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)
```

## Componentes

### Botões

#### Primário (Azul Ciano)
```tsx
<button className="bg-primary hover:bg-primary/90 text-white">
  Ação Principal
</button>
```

#### Secundário (Verde Limão)
```tsx
<button className="bg-secondary hover:bg-secondary/90 text-gray-900">
  Ação Secundária
</button>
```

#### Outline
```tsx
<button className="border-2 border-primary text-primary hover:bg-primary/10">
  Ação Terciária
</button>
```

### Cards

```tsx
<div className="bg-card rounded-lg shadow-md p-6 border border-border">
  {/* Conteúdo */}
</div>
```

### Badges

#### Status
```tsx
<span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
  Ativo
</span>
```

#### Urgência
```tsx
<span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm">
  Crítico
</span>
```

## Ícones

### Biblioteca
**Lucide React** - Ícones minimalistas e modernos

```tsx
import { Home, User, Settings } from 'lucide-react'

<Home className="w-5 h-5" />
```

### Tamanhos Padrão
- **xs**: 12px (w-3 h-3)
- **sm**: 16px (w-4 h-4)
- **md**: 20px (w-5 h-5)
- **lg**: 24px (w-6 h-6)
- **xl**: 32px (w-8 h-8)

## Animações

### Transições Suaves

```css
/* Padrão */
transition: all 150ms ease-in-out;

/* Hover */
transition: transform 200ms ease-in-out;

/* Fade */
transition: opacity 300ms ease-in-out;
```

### Micro-interações

```tsx
/* Hover Scale */
className="hover:scale-105 transition-transform"

/* Hover Brightness */
className="hover:brightness-110 transition-all"

/* Active Press */
className="active:scale-95 transition-transform"
```

## Layout

### Container
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Conteúdo */}
</div>
```

### Grid Responsivo
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

### Flex
```tsx
<div className="flex items-center justify-between gap-4">
  {/* Elementos */}
</div>
```

## Estados

### Hover
```css
hover:bg-primary/90
hover:scale-105
hover:shadow-lg
```

### Focus
```css
focus:ring-2
focus:ring-primary
focus:ring-offset-2
focus:outline-none
```

### Active
```css
active:scale-95
active:brightness-90
```

### Disabled
```css
disabled:opacity-50
disabled:cursor-not-allowed
disabled:pointer-events-none
```

## Responsividade

### Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile First

```tsx
/* Mobile por padrão */
<div className="text-sm md:text-base lg:text-lg">
  Texto responsivo
</div>

/* Grid responsivo */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  {/* Cards */}
</div>
```

## Acessibilidade

### Contraste
- Texto normal: mínimo 4.5:1
- Texto grande: mínimo 3:1
- Elementos interativos: mínimo 3:1

### ARIA Labels
```tsx
<button aria-label="Fechar modal">
  <X className="w-4 h-4" />
</button>
```

### Navegação por Teclado
```tsx
<button
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Acessível
</button>
```

## Exemplos de Uso

### Card de Ticket
```tsx
<div className="bg-card rounded-lg shadow-md p-6 border border-border hover:shadow-lg transition-shadow">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">#000123</h3>
    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
      Aberto
    </span>
  </div>
  <p className="text-muted-foreground mb-4">
    Descrição do problema...
  </p>
  <div className="flex items-center gap-2">
    <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg">
      Ver Detalhes
    </button>
    <button className="border border-border hover:bg-accent px-4 py-2 rounded-lg">
      Atribuir
    </button>
  </div>
</div>
```

### Dashboard Card
```tsx
<div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white shadow-lg">
  <div className="flex items-center justify-between mb-2">
    <h4 className="text-sm font-medium opacity-90">Total de Chamados</h4>
    <Ticket className="w-5 h-5 opacity-75" />
  </div>
  <p className="text-3xl font-bold">142</p>
  <p className="text-sm opacity-75 mt-1">+12% este mês</p>
</div>
```

## Princípios de Design

### 1. Minimalismo
- Remover elementos desnecessários
- Foco no conteúdo
- Espaço em branco generoso

### 2. Consistência
- Usar componentes reutilizáveis
- Manter padrões visuais
- Hierarquia clara

### 3. Feedback Visual
- Animações suaves
- Estados claros (hover, active, disabled)
- Confirmações visuais

### 4. Performance
- Otimizar imagens
- Lazy loading
- Transições leves

### 5. Acessibilidade
- Contraste adequado
- Navegação por teclado
- Screen reader friendly

---

**Design System atualizado com as cores da Tuicial** 🎨
**Azul Ciano (#00A8E8) + Verde Limão (#A4D233)**
**Estilo: Moderno e Minimalista**
