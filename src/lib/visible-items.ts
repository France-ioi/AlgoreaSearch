import { start } from '../http-services/item-init';
import { getNav, getRoots, NavItems } from '../http-services/nav';

/**
 * Return a list of the unique visible items
 */
export async function visibleItems(token: string): Promise<string[]> {
  const allDescendants = await visibleDescendants([], await getRoots({ token }), token);
  return [ ...new Set<string>(allDescendants) ]; /* ensure uniqueness */
}

/**
 * Return a list of all item descendants of navItems (including themselves)
 */
async function visibleDescendants(path: string[], navItems: NavItems, token: string): Promise<string[]> {
  const list = [];
  for (const navItem of navItems) {
    if (
      navItem.type === 'Chapter' &&
      navItem.has_visible_children &&
      navItem.permissions.can_view !== 'info' &&
      !navItem.requires_explicit_entry
    ) {
      const newPath = [ ...path, navItem.id ];
      await start(newPath, { token });
      list.push(navItem.id, ...await visibleDescendants(newPath, await getNav(navItem.id, { token }), token));
    } else list.push(navItem.id);
  }
  return list;
}