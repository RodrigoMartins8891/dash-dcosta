# OrdenhaPeças — Dashboard de Gestão

Sistema de gestão de estoque e vendas para empresa de peças de ordenhadeiras.

## Estrutura de arquivos

```
src/
├── App.jsx                          # Componente raiz: roteamento de views + estado global
│
├── constants/
│   └── index.js                     # Listas fixas (categorias, pagamento, frete) + dados iniciais
│
├── utils/
│   └── index.js                     # Funções puras: totalVenda, fmtBRL, fmtData, hoje, exportCSV
│
├── hooks/
│   └── useVendas.js                 # Estado de vendas + baixa automática de estoque
│
├── components/
│   ├── ui/
│   │   └── index.jsx                # Primitivos reutilizáveis: Badge, Btn, IconBtn,
│   │                                #   Input, Select, Modal, MetricCard, StockBar
│   │
│   └── modals/
│       ├── ModalPeca.jsx            # Criar / editar peça
│       ├── ModalNovaVenda.jsx       # Registrar nova venda
│       └── ModalVendaExtras.jsx     # ModalDetalhes + ModalNF + ModalAjuste
│
└── views/
    ├── ViewDashboard.jsx            # Métricas, gráficos e alertas
    ├── ViewVendas.jsx               # Listagem e gestão de vendas
    ├── ViewEstoque.jsx              # Controle de estoque com ajuste manual
    └── ViewPecas.jsx                # CRUD completo de peças
```

## Dependências

```bash
npm install recharts lucide-react
```

Tailwind CSS deve estar configurado no projeto.

## Como usar

```jsx
import DashboardOrdenhadeiras from "./src/App";

function MyApp() {
  return <DashboardOrdenhadeiras />;
}
```

## Guia de manutenção

| O que alterar               | Onde mexer                              |
|-----------------------------|-----------------------------------------|
| Adicionar categoria         | `constants/index.js` → `CATEGORIAS`     |
| Adicionar forma de pagamento| `constants/index.js` → `FORMAS_PAGAMENTO` |
| Novo campo na peça          | `ModalPeca.jsx` + `constants/index.js`  |
| Nova coluna em vendas       | `ViewVendas.jsx` + `ModalNovaVenda.jsx` |
| Mudar lógica de estoque     | `hooks/useVendas.js`                    |
| Mudar visual dos botões     | `components/ui/index.jsx` → `Btn`       |
| Novo gráfico no dashboard   | `views/ViewDashboard.jsx`               |
| Adicionar nova view/tela    | `App.jsx` → array `VIEWS` + novo arquivo em `views/` |
"# dash-dcosta" 
