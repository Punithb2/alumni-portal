import { useState, useEffect } from 'react';

const INITIAL_CAMPAIGNS = [
    {
        id: 'c1',
        title: 'Alumni Scholarship Fund 2026',
        story: 'Help us support the next generation of outstanding students. This fund will provide full tuition scholarships to 10 deserving students from underrepresented backgrounds.',
        longStory: `Every year, hundreds of bright, deserving students miss out on higher education simply because of financial barriers. Your contribution to the Alumni Scholarship Fund directly changes that reality.\n\nThis fund will provide full tuition scholarships to 10 outstanding students from underrepresented backgrounds — students who have the talent and drive to excel, but need financial support to get there.\n\nAs alumni, you have lived this journey. You know what it means to have access to quality education. Now is your chance to pay it forward.\n\nWhy this matters:\nEducation is the single most powerful tool for social mobility. By funding a scholarship, you're not just paying for tuition — you're investing in a future leader, researcher, entrepreneur, or changemaker who will go on to impact the world.`,
        impactExamples: [
            { amount: 500, impact: 'Covers one month of a student\'s living expenses' },
            { amount: 2000, impact: 'Funds one semester of textbooks and course materials' },
            { amount: 10000, impact: 'Provides a full semester scholarship for one student' },
            { amount: 50000, impact: 'Fully funds one complete 4-year scholarship' },
        ],
        goal: 50000,
        raised: 35000,
        currency: 'INR',
        deadline: '2026-12-31',
        status: 'active',
        category: 'scholarship',
        featured: true,
        urgent: false,
        donorCount: 142,
        allowAnonymous: true,
        allowRecurring: true,
        showDonorList: true,
        targetBatch: null,
        targetDepartment: null,
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
        createdAt: '2026-01-15T10:00:00.000Z',
        recentDonors: [
            { name: 'Priya Sharma', amount: 2000, date: '2026-03-06', anonymous: false },
            { name: 'Anonymous', amount: 5000, date: '2026-03-05', anonymous: true },
            { name: 'Rohan Mehta', amount: 1000, date: '2026-03-05', anonymous: false },
            { name: 'Ananya Iyer', amount: 500, date: '2026-03-04', anonymous: false },
            { name: 'Anonymous', amount: 10000, date: '2026-03-03', anonymous: true },
        ]
    },
    {
        id: 'c2',
        title: 'Emergency Relief: Student Flood Aid',
        story: 'Cyclone Maha has displaced 200+ students from hostels in the eastern campus. We need urgent funds for temporary shelter, food, and essential supplies.',
        longStory: `Cyclone Maha has wreaked havoc on our eastern campus, displacing over 200 students from their hostels. The situation is dire — students have lost personal belongings, study materials, and access to safe shelter.\n\nYour emergency donation will be deployed within 48 hours to provide:\n• Temporary accommodation at partner facilities\n• Three meals a day for affected students\n• Replacement of essential study materials\n• Mental health counselling services\n\nEvery rupee donated goes directly to student welfare. The administration has committed to zero overhead on this emergency fund.`,
        impactExamples: [
            { amount: 250, impact: 'Feeds one displaced student for a week' },
            { amount: 1000, impact: 'Covers emergency accommodation for 5 nights' },
            { amount: 3000, impact: 'Replaces a student\'s essential study materials' },
            { amount: 15000, impact: 'Provides full relief support for one student for a month' },
        ],
        goal: 200000,
        raised: 87500,
        currency: 'INR',
        deadline: '2026-04-15',
        status: 'active',
        category: 'emergency',
        featured: false,
        urgent: true,
        donorCount: 318,
        allowAnonymous: true,
        allowRecurring: false,
        showDonorList: true,
        targetBatch: null,
        targetDepartment: null,
        imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80',
        createdAt: '2026-02-28T08:00:00.000Z',
        recentDonors: [
            { name: 'Vikram Nair', amount: 5000, date: '2026-03-07', anonymous: false },
            { name: 'Anonymous', amount: 25000, date: '2026-03-07', anonymous: true },
            { name: 'Deepa Krishnan', amount: 2000, date: '2026-03-06', anonymous: false },
            { name: 'Anonymous', amount: 1000, date: '2026-03-06', anonymous: true },
            { name: 'Suresh Patel', amount: 500, date: '2026-03-05', anonymous: false },
        ]
    },
    {
        id: 'c3',
        title: 'New Library Tech Wing',
        story: 'Upgrade the university library with a state-of-the-art tech wing featuring AR/VR labs, high-speed collaborative workspaces, and 24/7 digital resource access.',
        longStory: `The future of education is digital, collaborative, and immersive. Our current library facilities, while functional, are over 20 years old and lack the infrastructure needed to prepare students for the modern world.\n\nThe New Library Tech Wing will feature:\n• 10 AR/VR pods for immersive learning experiences\n• 50-seat high-speed collaborative workspace\n• Maker space with 3D printers and prototyping tools\n• Digital archive of 50,000+ research papers\n• 24/7 AI-assisted research support system\n\nThis investment will serve every student for decades to come. Your name will be etched on the Donor Wall inside the new wing.`,
        impactExamples: [
            { amount: 1000, impact: 'Funds a digital research subscription for one year' },
            { amount: 5000, impact: 'Equips one collaborative study pod' },
            { amount: 25000, impact: 'Contributes to one AR/VR learning station' },
            { amount: 100000, impact: 'Names a section of the tech wing after you' },
        ],
        goal: 1000000,
        raised: 245000,
        currency: 'INR',
        deadline: '2026-09-30',
        status: 'active',
        category: 'infrastructure',
        featured: true,
        urgent: false,
        donorCount: 89,
        allowAnonymous: true,
        allowRecurring: true,
        showDonorList: true,
        targetBatch: null,
        targetDepartment: null,
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
        createdAt: '2026-01-01T00:00:00.000Z',
        recentDonors: [
            { name: 'Arvind Gupta', amount: 50000, date: '2026-03-01', anonymous: false },
            { name: 'Anonymous', amount: 100000, date: '2026-02-20', anonymous: true },
            { name: 'Meena Joshi', amount: 5000, date: '2026-02-15', anonymous: false },
        ]
    },
    {
        id: 'c4',
        title: 'Alumni Annual Marathon',
        story: 'Join us for the 5th Annual Alumni Marathon. Run for health, run for unity! A strictly free participation event.',
        longStory: `The path to a healthy mind and body is one we run together. This year marks the 5th Annual Alumni Marathon, and we invite all alumni to participate.\n\nThere is no cost to register! Simply sign up, get your running shoes on, and join your fellow batchmates on campus or virtually from wherever you are.\n\n• Free participation for all alumni\n• Special t-shirts for early registrants\n• Refreshments provided at the finish line\n• Earn gamification points for participating!`,
        impactExamples: [],
        goal: 500,
        raised: 120,
        currency: 'INR',
        deadline: '2026-05-10',
        status: 'active',
        category: 'sports',
        campaignType: 'participation',
        featured: true,
        urgent: false,
        donorCount: 120,
        allowAnonymous: false,
        allowRecurring: false,
        showDonorList: true,
        targetBatch: null,
        targetDepartment: null,
        imageUrl: 'https://images.unsplash.com/photo-1552674605-15c2145efa36?w=800&q=80',
        createdAt: '2026-03-01T00:00:00.000Z',
        recentDonors: [
            { name: 'Neha Reddy', amount: 1, date: '2026-03-10', anonymous: false },
            { name: 'Rajesh Kumar', amount: 1, date: '2026-03-09', anonymous: false },
            { name: 'Simran Patil', amount: 1, date: '2026-03-08', anonymous: false },
        ]
    },
    {
        id: 'c5',
        title: 'AI Research Lab Endowment',
        story: 'Fund cutting-edge AI and machine learning research that will power India\'s next generation of tech innovation, led by faculty and doctoral students.',
        longStory: `India's technology sector is booming, but our academic institutions need world-class research facilities to keep pace. This endowment will establish a permanent AI Research Lab that funds ongoing research in machine learning, computer vision, NLP, and ethical AI.\n\nResearch areas:\n• Generative AI for regional language processing\n• Computer vision for agricultural applications\n• Ethical AI frameworks for public policy\n• ML-powered medical diagnostics\n\nFunds will cover researcher salaries, GPU clusters, dataset licensing, and conference attendance. Donors of ₹1L+ will be named on the lab's permanent advisory board.`,
        impactExamples: [
            { amount: 2000, impact: 'Funds a researcher\'s conference registration' },
            { amount: 10000, impact: 'Covers GPU compute costs for one month' },
            { amount: 50000, impact: 'Sponsors a doctoral researcher for one semester' },
            { amount: 500000, impact: 'Names a research project after you or your organization' },
        ],
        goal: 2000000,
        raised: 520000,
        currency: 'INR',
        deadline: '2027-03-31',
        status: 'active',
        category: 'research',
        featured: false,
        urgent: false,
        donorCount: 54,
        allowAnonymous: true,
        allowRecurring: true,
        showDonorList: false,
        targetBatch: null,
        targetDepartment: 'Computer Science',
        imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
        createdAt: '2025-10-01T00:00:00.000Z',
        recentDonors: [
            { name: 'Dr. Kavita Rao', amount: 100000, date: '2026-02-10', anonymous: false },
            { name: 'Anonymous', amount: 200000, date: '2026-01-20', anonymous: true },
        ]
    },
    {
        id: 'c5',
        title: 'Campus Sports Complex Renovation',
        story: 'Renovate and modernize the campus sports facilities to foster physical well-being and inter-collegiate sports achievement.',
        longStory: `A healthy body nurtures a healthy mind. Our sports complex, built in 1998, serves thousands of students and staff daily — but it desperately needs modernization.\n\nThe renovation will include:\n• New Astroturf football and hockey grounds\n• Olympic-standard 25m indoor swimming pool\n• Refurbished gymnasium with modern equipment\n• 6 new badminton courts and 4 squash courts\n• Sports medicine clinic and physiotherapy centre\n\nThis project will enable us to host inter-collegiate and national-level competitions, bringing prestige and visibility to our institution.`,
        impactExamples: [
            { amount: 500, impact: 'Covers one month of maintenance for a court' },
            { amount: 5000, impact: 'Equips one gym station with modern equipment' },
            { amount: 50000, impact: 'Sponsors renovation of one sports court' },
            { amount: 500000, impact: 'Names a facility after you or your family' },
        ],
        goal: 5000000,
        raised: 5000000,
        campaignType: 'donation',
        currency: 'INR',
        deadline: '2025-12-31',
        status: 'completed',
        category: 'infrastructure',
        featured: false,
        urgent: false,
        donorCount: 421,
        allowAnonymous: true,
        allowRecurring: false,
        showDonorList: true,
        targetBatch: null,
        targetDepartment: null,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
        createdAt: '2025-01-01T00:00:00.000Z',
        recentDonors: []
    },
    {
        id: 'c6',
        title: 'Annual Blood Donation Camp',
        story: 'Join us for our annual campus-wide blood donation drive. Your single donation can save up to 3 lives in our local community.',
        longStory: `In partnership with the City General Hospital, our Alumni Association is hosting the 15th Annual Blood Donation Camp. We are aiming for a record-breaking 1000 pints of blood this year to help address the severe shortage in local blood banks.\n\nEvery pint of blood can save up to three lives. Whether you are a regular donor or a first-timer, your participation makes a massive difference.\n\nDate: Saturday, April 15, 2026\nTime: 9:00 AM - 5:00 PM\nLocation: University Main Auditorium\n\nPlease ensure you are well-rested and hydrated. Refreshments and a comfortable resting area will be provided for all donors.`,
        campaignType: 'participation',
        goal: 1000,
        raised: 450,
        currency: null,
        deadline: '2026-04-15',
        status: 'active',
        category: 'health',
        featured: true,
        urgent: false,
        donorCount: 450,
        allowAnonymous: false,
        allowRecurring: false,
        showDonorList: true,
        targetBatch: null,
        targetDepartment: null,
        imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&q=80',
        createdAt: '2026-02-01T00:00:00.000Z',
        recentDonors: [
            { name: 'Dr. Ramesh Kumar', amount: 'Participating', date: '2026-03-08' },
            { name: 'Anita Singh', amount: 'Participating', date: '2026-03-07' }
        ]
    },
    {
        id: 'c7',
        title: 'Alumni Tech Marathon 2026',
        story: 'Run for a cause! Join fellow alumni in our 5K and 10K runs to promote fitness and raise awareness for mental health on campus.',
        longStory: `Lace up your running shoes! The Alumni Tech Marathon is back. This year, we are running not just for fitness, but to raise awareness and support for student mental health initiatives.\n\nCategories:\n- 5K Fun Run\n- 10K Competitive Run\n\nThere is no registration fee for alumni. Bring your family and friends. Post-run celebrations include food trucks, live music from student bands, and networking zones. Let's show our students that the alumni community supports them every step of the way!`,
        campaignType: 'participation',
        goal: 2000,
        raised: 820,
        currency: null,
        deadline: '2026-05-10',
        status: 'active',
        category: 'sports',
        featured: false,
        urgent: false,
        donorCount: 820,
        allowAnonymous: false,
        allowRecurring: false,
        showDonorList: true,
        targetBatch: null,
        targetDepartment: null,
        imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
        createdAt: '2026-02-15T00:00:00.000Z',
        recentDonors: []
    }
];

const INITIAL_MY_DONATIONS = [
    { id: 'd1', campaignId: 'c1', campaignTitle: 'Alumni Scholarship Fund 2026', amount: 2000, date: '2026-02-14', status: 'completed', anonymous: false, recurring: false, currency: 'INR' },
    { id: 'd2', campaignId: 'c3', campaignTitle: 'New Library Tech Wing', amount: 5000, date: '2026-01-10', status: 'completed', anonymous: false, recurring: true, frequency: 'monthly', currency: 'INR' },
    { id: 'd3', campaignId: 'c5', campaignTitle: 'Campus Sports Complex Renovation', amount: 1000, date: '2025-08-20', status: 'completed', anonymous: false, recurring: false, currency: 'INR' },
];

export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState(() => {
        const saved = localStorage.getItem('mock_campaigns_v2');
        if (saved && saved.length > 10) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        localStorage.setItem('mock_campaigns_v2', JSON.stringify(INITIAL_CAMPAIGNS));
        return INITIAL_CAMPAIGNS;
    });

    const [myDonations, setMyDonations] = useState(() => {
        const saved = localStorage.getItem('mock_my_donations');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        localStorage.setItem('mock_my_donations', JSON.stringify(INITIAL_MY_DONATIONS));
        return INITIAL_MY_DONATIONS;
    });

    useEffect(() => {
        localStorage.setItem('mock_campaigns_v2', JSON.stringify(campaigns));
    }, [campaigns]);

    useEffect(() => {
        localStorage.setItem('mock_my_donations', JSON.stringify(myDonations));
    }, [myDonations]);

    const addCampaign = (data) => {
        const newCampaign = {
            ...data,
            id: `c_${Date.now()}`,
            raised: 0,
            donorCount: 0,
            createdAt: new Date().toISOString(),
            status: 'active',
            recentDonors: [],
            featured: data.featured || false,
            urgent: data.urgent || false,
            allowAnonymous: data.allowAnonymous !== false,
            allowRecurring: data.allowRecurring !== false,
            showDonorList: data.showDonorList !== false,
        };
        setCampaigns(prev => [newCampaign, ...prev]);
        return newCampaign;
    };

    const updateCampaign = (id, data) => {
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    };

    const deleteCampaign = (id) => {
        setCampaigns(prev => prev.filter(c => c.id !== id));
    };

    const donateToCampaign = (id, amount, options = {}) => {
        const { donorName = 'You', anonymous = false, recurring = false, frequency = null } = options;
        const now = new Date().toISOString().split('T')[0];

        setCampaigns(prev => prev.map(c => {
            if (c.id === id) {
                const newDonor = { name: anonymous ? 'Anonymous' : donorName, amount: Number(amount), date: now, anonymous };
                return {
                    ...c,
                    raised: c.raised + Number(amount),
                    donorCount: c.donorCount + 1,
                    recentDonors: [newDonor, ...(c.recentDonors || [])].slice(0, 10)
                };
            }
            return c;
        }));

        const campaign = campaigns.find(c => c.id === id);
        if (campaign) {
            const newDonation = {
                id: `d_${Date.now()}`,
                campaignId: id,
                campaignTitle: campaign.title,
                amount: Number(amount),
                date: now,
                status: 'completed',
                anonymous,
                recurring,
                frequency: recurring ? frequency : null,
                currency: campaign.currency || 'INR'
            };
            setMyDonations(prev => [newDonation, ...prev]);
        }
    };

    const cancelRecurring = (donationId) => {
        setMyDonations(prev => prev.map(d => d.id === donationId ? { ...d, recurring: false, status: 'cancelled' } : d));
    };

    const participateInCampaign = (id, options = {}) => {
        const { participantName = 'You' } = options;
        const now = new Date().toISOString().split('T')[0];

        setCampaigns(prev => prev.map(c => {
            if (c.id === id) {
                const newParticipant = { name: participantName, amount: 'Participating', date: now };
                return {
                    ...c,
                    raised: c.raised + 1,
                    donorCount: c.donorCount + 1,
                    recentDonors: [newParticipant, ...(c.recentDonors || [])].slice(0, 10)
                };
            }
            return c;
        }));

        const campaign = campaigns.find(c => c.id === id);
        if (campaign) {
            const newParticipation = {
                id: `p_${Date.now()}`,
                campaignId: id,
                campaignTitle: campaign.title,
                amount: 'Participating',
                date: now,
                status: 'completed',
                anonymous: false,
                recurring: false,
                currency: null,
                campaignType: 'participation'
            };
            setMyDonations(prev => [newParticipation, ...prev]);
        }
    };

    return {
        campaigns,
        myDonations,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        donateToCampaign,
        participateInCampaign,
        cancelRecurring,
        getCampaignById: (id) => campaigns.find(c => c.id === id)
    };
};
