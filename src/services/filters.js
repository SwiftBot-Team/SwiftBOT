module.exports = {
    eightD: {
      rotation: {
           rotationHz: 0.2
      }  
    },
	nightcore: {
		timescale: {
                        rate: 1.1,
                        pitch: 1.2
                    },
                equalizer: [
                        { band: 1, gain: 0.3 },
                        { band: 0, gain: .3 }
                    ],
		tremolo: { depth: 0.3, frequency: 14 }
	},
	bassboost: {
		equalizer: new Array(6).fill(null).map((_, i) => ({ band: i, gain: 0.30 }))
	},
	soft: {
		equalizer: [
           		 { 'band': 0, 'gain': 0 },
           		 { 'band': 1, 'gain': 0 },
           		 { 'band': 2, 'gain': 0 },
           		 { 'band': 3, 'gain': 0 },
           		 { 'band': 4, 'gain': 0 },
           		 { 'band': 5, 'gain': 0 },
           		 { 'band': 6, 'gain': 0 },
           		 { 'band': 7, 'gain': 0 },
            		 { 'band': 8, 'gain': -0.25 },
           		 { 'band': 9, 'gain': -0.25 },
           		 { 'band': 10, 'gain': -0.25 },
           		 { 'band': 11, 'gain': -0.25 },
            		 { 'band': 12, 'gain': -0.25 },
            		 { 'band': 13, 'gain': -0.25 },
       		],
	},
	pop: {
		equalizer: [
           		 { 'band': 0, 'gain': 0.65 },
           		 { 'band': 1, 'gain': 0.45 },
            		 { 'band': 2, 'gain': -0.45 },
           		 { 'band': 3, 'gain': -0.65 },
            		 { 'band': 4, 'gain': -0.35 },
            		 { 'band': 5, 'gain': 0.45 },
            		 { 'band': 6, 'gain': 0.55 },
            		 { 'band': 7, 'gain': 0.6 },
            		 { 'band': 8, 'gain': 0.6 },
            		 { 'band': 9, 'gain': 0.6 },
            		 { 'band': 10, 'gain': 0 },
            		 { 'band': 11, 'gain': 0 },
            		 { 'band': 12, 'gain': 0 },
            		 { 'band': 13, 'gain': 0 },
        	],
	},
	treblebass: {
		equalizer: [
            		{ 'band': 0, 'gain': 0.6 },
            		{ 'band': 1, 'gain': 0.67 },
            		{ 'band': 2, 'gain': 0.67 },
            		{ 'band': 3, 'gain': 0 },
            		{ 'band': 4, 'gain': -0.5 },
            		{ 'band': 5, 'gain': 0.15 },
            		{ 'band': 6, 'gain': -0.45 },
            		{ 'band': 7, 'gain': 0.23 },
            		{ 'band': 8, 'gain': 0.35 },
            		{ 'band': 9, 'gain': 0.45 },
            		{ 'band': 10, 'gain': 0.55 },
            		{ 'band': 11, 'gain': 0.6 },
            		{ 'band': 12, 'gain': 0.55 },
            		{ 'band': 13, 'gain': 0 },
        	],
	},
	nightcore: {
		timescale: {
                        rate: 1.1,
                        pitch: 1.2
                    },
                    equalizer: [
                        { band: 1, gain: 0.3 },
                        { band: 0, gain: .3 }
                    ],
		    tremolo: { depth: 0.3, frequency: 14 },
	},
	daycore: {
		timescale: {
			pitch: 0.8,
			rate: 0.8
		}
	},
	vaporwave: {
		equalizer: [
            { band: 1, gain: 0.3 },
            { band: 0, gain: 0.3 },
        ],
        timescale: { pitch: 0.5 },
        tremolo: { depth: 0.3, frequency: 14 },
	},
	
	vibrato: {
		vibrato: {
			frequency: 10,
			depth: 1
		},
		timescale: {
			pitch: 1.09
		}
		
	}
}
