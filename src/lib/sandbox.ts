export type MaterialId = 'hydrogen' | 'bromine' | 'iron' | 'water';
export type EquipmentId = 'flask' | 'beaker' | 'tube' | 'rack' | 'pipette' | 'cylinder' | 'rod' | 'thermometer' | 'burner';
export type ObjectType = MaterialId | EquipmentId;
export type Content = { material: MaterialId; quantity: number; unit: 'mL' | 'g' };
export type LabObject = { id: string; type: ObjectType; position: [number, number, number]; rotation: number; contents: Content[]; temperature: number; quantity?: number; reaction?: string };
export type LabEvent = { id: string; type: string; at: string; text: string; source?: string; target?: string; substance?: MaterialId; quantity?: number; unit?: string };
export type LabState = { objects: LabObject[]; events: LabEvent[]; selected: string | null; paused: boolean; warnings: string[]; reactions: string[] };
export const initialLab: LabState = { objects: [], events: [], selected: null, paused: false, warnings: [], reactions: [] };
export const materials: Record<MaterialId, { name: string; formula: string; state: string; color: string; description: string }> = {
  hydrogen: { name: 'Hydrogen', formula: 'H₂', state: 'Gas', color: '#c6ecf4', description: 'A light diatomic gas. In this sandbox it disperses inside a vessel.' },
  bromine: { name: 'Bromine', formula: 'Br₂', state: 'Liquid', color: '#a74626', description: 'A reddish brown liquid at room temperature. Its vapour is hazardous.' },
  iron: { name: 'Iron', formula: 'Fe', state: 'Solid', color: '#7e8586', description: 'A transition metal whose atoms form a crystal lattice.' },
  water: { name: 'Water', formula: 'H₂O', state: 'Liquid', color: '#78cfe0', description: 'A common solvent used here as a supporting material.' },
};
export const equipment: Record<EquipmentId, { name: string; container?: boolean }> = {
  flask: { name: 'Erlenmeyer flask', container: true }, beaker: { name: 'Beaker', container: true }, tube: { name: 'Test tube', container: true },
  rack: { name: 'Test tube rack' }, pipette: { name: 'Pipette / dropper' }, cylinder: { name: 'Measuring cylinder', container: true },
  rod: { name: 'Stirring rod' }, thermometer: { name: 'Thermometer' }, burner: { name: 'Bunsen burner' },
};
export const reactions = [{ id: 'iron-bromine', reactants: ['iron', 'bromine'] as MaterialId[], minimumTemperature: 80, product: 'Iron(III) bromide', equation: '2 Fe + 3 Br₂ → 2 FeBr₃', explanation: 'This simplified demonstration marks iron and bromine reacting when both are in a heated vessel. Quantitative stoichiometry is outside this model.', safety: 'Bromine is corrosive and heating can release hazardous vapour.' }];
export const isMaterial = (type: ObjectType): type is MaterialId => type in materials;
export const isContainer = (object: LabObject) => !isMaterial(object.type) && !!equipment[object.type].container;
export const objectName = (type: ObjectType) => isMaterial(type) ? materials[type].name : equipment[type].name;
const event = (type: string, text: string, extra: Partial<LabEvent> = {}): LabEvent => ({ id: crypto.randomUUID(), type, text, at: new Date().toISOString(), ...extra });
const withEvent = (state: LabState, next: Partial<LabState>, e: LabEvent): LabState => ({ ...state, ...next, events: [...state.events, e] });
export type LabAction = { type: 'restore'; state: LabState } | { type: 'add'; object: ObjectType; position?: [number, number, number] } | { type: 'select'; id: string | null } | { type: 'move'; id: string; position: [number, number, number] } | { type: 'rotate'; id: string } | { type: 'remove'; id: string } | { type: 'empty'; id: string } | { type: 'transfer'; source: string; target: string; amount?: number } | { type: 'heat'; id: string } | { type: 'pause' } | { type: 'reset' };
export function labReducer(state: LabState, action: LabAction): LabState {
  if (action.type === 'restore') return action.state;
  if (action.type === 'select') return { ...state, selected: action.id };
  if (action.type === 'pause') return { ...state, paused: !state.paused };
  if (action.type === 'reset') return { ...initialLab, events: [...state.events, event('EXPERIMENT_RESET', 'Experiment reset')] };
  if (action.type === 'add') {
    const id = crypto.randomUUID(); const material = isMaterial(action.object);
    const contents: Content[] = action.object === 'bromine' || action.object === 'water' ? [{ material: action.object, quantity: 50, unit: 'mL' }] : [];
    const object: LabObject = { id, type: action.object, position: action.position ?? [Math.random() * 2 - 1, 0, Math.random() * 1.5 - .75], rotation: 0, contents, temperature: 24, ...(action.object === 'iron' ? { quantity: 5 } : action.object === 'hydrogen' ? { quantity: 20 } : {}) };
    return withEvent(state, { objects: [...state.objects, object], selected: id }, event('OBJECT_ADDED', `${objectName(action.object)} placed on the workbench`, { target: id }));
  }
  const object = state.objects.find(x => x.id === ('id' in action ? action.id : action.type === 'transfer' ? action.source : ''));
  if (!object) return state;
  if (action.type === 'move') return withEvent(state, { objects: state.objects.map(x => x.id === object.id ? { ...x, position: action.position } : x) }, event('OBJECT_MOVED', `${objectName(object.type)} moved`, { target: object.id }));
  if (action.type === 'rotate') return withEvent(state, { objects: state.objects.map(x => x.id === object.id ? { ...x, rotation: x.rotation + Math.PI / 4 } : x) }, event('OBJECT_ROTATED', `${objectName(object.type)} rotated`, { target: object.id }));
  if (action.type === 'remove') return withEvent(state, { objects: state.objects.filter(x => x.id !== object.id), selected: null }, event('OBJECT_REMOVED', `${objectName(object.type)} removed`, { target: object.id }));
  if (action.type === 'empty') return withEvent(state, { objects: state.objects.map(x => x.id === object.id ? { ...x, contents: [] } : x) }, event('CONTAINER_EMPTIED', `${objectName(object.type)} emptied`, { target: object.id }));
  if (action.type === 'heat') {
    const temperature = Math.min(120, object.temperature + 20);
    const warnings = temperature >= 80 ? ['Hot vessel: heating bromine may release hazardous vapour.'] : state.warnings;
    const rule = reactions.find(r => temperature >= r.minimumTemperature && !object.reaction && r.reactants.every(m => object.contents.some(c => c.material === m && c.quantity > 0)));
    const next = withEvent(state, { objects: state.objects.map(x => x.id === object.id ? { ...x, temperature, ...(rule ? {reaction: rule.id} : {}) } : x), warnings }, event('TEMPERATURE_CHANGED', `${objectName(object.type)} reached ${temperature}°C`, { target: object.id }));
    return rule ? withEvent(next, { reactions: [...next.reactions, `${rule.equation} in ${objectName(object.type)}`], warnings: [...warnings, rule.safety] }, event('REACTION_COMPLETED', `${rule.product} formed in the simulation`, { target: object.id })) : next;
  }
  if (action.type === 'transfer') {
    const target = state.objects.find(x => x.id === action.target);
    if (!target || !isContainer(target) || target.id === object.id) return state;
    const content = object.contents[0];
    const material: MaterialId | null = content?.material ?? (object.type === 'hydrogen' || object.type === 'iron' ? object.type : null);
    if (!material) return state;
    const amount = Math.min(action.amount ?? (material === 'iron' ? 1 : 10), content?.quantity ?? object.quantity ?? 0);
    if (amount <= 0) return state;
    const unit = material === 'iron' ? 'g' : 'mL';
    const objects = state.objects.map(x => x.id === object.id ? { ...x, contents: content ? [{ ...content, quantity: content.quantity - amount }] : x.contents, ...(x.quantity === undefined ? {} : { quantity: x.quantity - amount }) } : x.id === target.id ? { ...x, contents: [...x.contents, { material, quantity: amount, unit: unit as 'g' | 'mL' }] } : x);
    const warnings = material === 'bromine' ? [...new Set([...state.warnings, 'Bromine is corrosive and volatile. This is a simulation only.'])] : state.warnings;
    return withEvent(state, { objects, warnings, selected: target.id }, event('SUBSTANCE_TRANSFERRED', `${amount} ${unit} ${materials[material].name} transferred into ${objectName(target.type)}`, { source: object.id, target: target.id, substance: material, quantity: amount, unit }));
  }
  return state;
}
export function buildExperimentContext(state: LabState) { return { objects: state.objects.map(x => ({ id: x.id, name: objectName(x.type), type: x.type, physicalState: isMaterial(x.type) ? materials[x.type].state : undefined, quantity: x.quantity, contents: x.contents, temperature: x.temperature })), selected: state.selected, reactions: state.reactions, warnings: state.warnings, recentEvents: state.events.slice(-12).map(({ type, text, at, substance, quantity, unit }) => ({ type, text, at, substance, quantity, unit })) }; }
