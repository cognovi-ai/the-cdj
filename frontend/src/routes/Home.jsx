import Home from '../components/Home';

const cds = [
    { example: 'If I can\'t get this perfectly, then I must not be good enough.', label: 'All-or-Nothing Thinking', reframing: 'I don\'t have to be perfect to be good enough.', analysis: 'The thought presented displays a classic example of \'all-or-nothing thinking,\' which is a type of cognitive distortion. This distortion manifests as viewing situations in only two categories rather than on a continuum. The idea that not achieving perfection equates to not being good enough is a harsh and unrealistic standard that can lead to feelings of inadequacy and failure. An alternative thought might be: \'Doing my best is good enough, and perfection isn\'t required for me to be valuable or successful. Each effort is a learning experience and contributes to my growth.\'' },
    { example: 'Why does this always happen to me?', label: 'Overgeneralization', reframing: 'This is just one bad thing that happened.' },
    { example: 'What good can come from that?', label: 'Mental Filter', reframing: 'There are good things that can come from this.' },
    { example: 'It doesn\'t matter, anyone could have done it.', label: 'Disqualifying the Positive', reframing: 'I did a good job and I should be proud of myself.' },
    { example: 'I know you dont\'t think I can do this.', label: 'Mind Reading', reframing: 'You may or may not think I know how to do this, but I know I can do it and that\'s what matters.' },
    { example: 'I\'m going to embarrass myself.', label: 'Fortune Telling', reframing: 'I don\'t know what will happen, but I\'ll be okay.' },
    { example: 'What if it ruins everything?', label: 'Catastrophizing', reframing: 'It might not be as bad as I think.' },
    { example: 'There\'s nothing significant about my achievements.', label: 'Minimization', reframing: 'I have achieved a lot and I should be proud of myself.' },
    { example: 'I feel like a failure so I guess that makes me one.', label: 'Emotional Reasoning', reframing: 'I feel like a failure, but that doesn\'t mean I am one.' },
    { example: 'I should be doing much better than I am.', label: 'Should Statements', reframing: 'I\'m doing the best I can and that\'s enough.' },
    { example: 'They didn\'t have a good time because of me.', label: 'Personalization', reframing: 'They seemed like they didn\'t have a good time, I hope they\'re okay.' },
]

export default function HomeRoute() {
    return (
        <Home data={{ cds }} />
    );
}