const Event = {
	name: 'READY',
	async execute(data, contextSetters) {
		contextSetters.setUser(data.user);
		contextSetters.setCharacters(data.characters);
		contextSetters.setChronicles(data.chronicles);
	},
};

export default Event;