const icons = []
const modules: any = null // import.meta.glob('./../../assets/icons/svg/*.svg'); RY
for (const path in modules) {
  const p = path.split('assets/icons/svg/')[1].split('.svg')[0];
  (icons as any).push(p);
}

export default icons
