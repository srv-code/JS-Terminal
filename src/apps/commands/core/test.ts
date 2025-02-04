export default function test(args) {
  console.log('test | init', {args});
  
  switch(args['_'][1]) {
    case 'hi': return console.log('hi');
    default: return console.error('Not a valid test command: ' + args[0]);
  }
}
