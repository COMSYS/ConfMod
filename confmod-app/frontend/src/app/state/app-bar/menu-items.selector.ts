import { createSelector } from "@ngrx/store";
import { selectConfigs } from "../config-list/configs.selector";
import { MenuItem } from "primeng/api";
import { PrimeIcons } from "primeng/api";

interface ConfigNameAndSlug {
    name: string;
    slug: string;
}

const SEPARATOR: MenuItem[] = [
  { separator: true }
]

const MENU_ITEMS_PRE: MenuItem[] = [
  {
    label: 'Home',
    icon: 'pi pi-home',
    routerLink: '/'
  }
]

const MENU_ITEMS_POST = [
  {
    label: 'New Config',
    icon: 'pi pi-plus',
    routerLink: '/new-config',
  }
]
const selectConfigNameAndSlug = createSelector(
    selectConfigs,
    (configs) => configs.map(config => ({ name: config.name, slug: config.slug }))
)

export const selectAppBarMenuItems = createSelector(
    selectConfigNameAndSlug,
    (nameAndSlugs) => MENU_ITEMS_PRE
      .concat(nameAndSlugs.length ? SEPARATOR : [])
      .concat(nameAndSlugs.map(({ name, slug }) => toMenuItem(name, slug)))
      .concat(nameAndSlugs.length ? SEPARATOR : [])
      .concat(MENU_ITEMS_POST)
)

function toMenuItem(name: string, slug: string) {
    return {
      label: name,
      icon: PrimeIcons.FILE,
      routerLink: ['editor', slug],
      type: "config",
      model: {
        slug: slug,
        name: name,
      },
      items: [
        {
          label: `Edit`,
          icon: PrimeIcons.PENCIL,
          routerLink: ['editor', slug],
        },
        {
          label: 'Compare Scopes',
          icon: PrimeIcons.CHART_BAR,
          routerLink: ['scope-compare', slug],
        }
      ]
    }
}