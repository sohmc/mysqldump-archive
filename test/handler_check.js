const LambdaTester = require( 'lambda-tester' );
const myHandler = require( '../index.js' ).handler;
 
describe( 'handler', function() {
    it( 'test success', function() {
        return LambdaTester( myHandler )
            .event( { name: 'Fred' } )
            .expectResult();
    });
});
