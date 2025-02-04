export default function echo(args) {
  console.log(args);
  
  args['_'].shift();
  const line = args['_'].join(' ');
  console.log(line);
}