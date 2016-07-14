/**
 * Exported module
 * @type {Boolean}
 */

/** **************************************************************/
class Subset {
    union( that ) {
	return this.complement().intersect( that.complement() ).complement();
    }

    intersectWithOpenInterval( that ) {
	return this.intersect( that );
    }

    setMinus( that ) {
	return this.intersect( that.complement() );
    }

    symmetricDifference( that ) {
	return ( this.setMinus( that ) ).union( that.setMinus( this ) );
    }

    equals( that ) {
	return this.symmetricDifference( that ).isEmpty();
    }
}

/** **************************************************************/
class EmptySet extends Subset {
    union( that ) {
	return that;
    }

    intersect( /* subset */ ) {
	return new EmptySet();
    }

    contains( /* element */ ) {
	return false;
    }

    isEmpty() {
	return true;
    }

    complement() {
	return new RealLine();
    }

    toString() {
	return '0';
    }
}

/** **************************************************************/
class RealLine extends Subset {
    union( /* that */ ) {
	return new RealLine();
    }

    intersect( that ) {
	return that;
    }

    contains( /* element */ ) {
	return true;
    }

    complement() {
	return new EmptySet();
    }

    isEmpty() {
	return false;
    }

    toString() {
	return 'R';
    }
}

/** **************************************************************/
class Singleton extends Subset {
    constructor( element ) {
	super();
	this.element = element;
    }

    union( that ) {
	if ( that.contains( this.element ) ) {
	    return that;
	} /* else */
	
	return new Union( [that, this] );
    }

    intersect( subset ) {
	if ( subset.contains( this.element ) ) {
	    return new Singleton( this.element );
	} /* else */

	return new EmptySet();
    }

    isEmpty() {
	return false;
    }

    contains( element ) {
	return ( element === this.element );
    }

    complement() {
	return new Union( [new OpenInterval( -Infinity, this.element ),
			   new OpenInterval( this.element, Infinity )] );
    }

    toString() {
	return `{${this.element}}`;
    }
}

/** **************************************************************/
class Union extends Subset {
    intersect( subset ) {
	return new Union( this.subsets.map( s => subset.intersect( s ) ) );
    }

    toString() {
	return this.subsets.map( s => s.toString() ).join( ' U ' );
    }

    constructor( subsets ) {
	super();
	this.subsets = subsets.filter( s => ! s.isEmpty() );

	if ( this.subsets.length === 0 ) {
	    return new EmptySet();
	}

	return this;
    }

    contains( element ) {
	return this.subsets.some( s => s.contains( element ) );
    }

    isEmpty() {
	return this.subsets.every( s => s.isEmpty() );
    }

    complement() {
	return this.subsets.
	    map( s => s.complement() ).
	    reduce( ( a, b ) => a.intersect( b ) );
    }
}

/** **************************************************************/
class Interval extends Subset {
    constructor( left, right ) {
	super();
	this.left = left;
	this.right = right;

	if ( this.left > this.right ) {
	    return new EmptySet();
	}

	return this;
    }
}

/** **************************************************************/
class OpenInterval extends Interval {
    constructor( left, right ) {
	super( left, right );

	if ( left === right ) {
	    return new EmptySet();
	}

	return this;
    }

    intersect( subset ) {
	return subset.intersectWithOpenInterval( this );
    }

    intersectWithOpenInterval( that ) {
	return new OpenInterval( Math.max( this.left, that.left ), Math.min( this.right, that.right ) );
    }

    complement() {
	return new Union( [new OpenClosedInterval( -Infinity, this.left ),
			   new ClosedOpenInterval( this.right, Infinity )] );
    }

    isEmpty() {
	return ( this.left >= this.right );
    }

    contains( element ) {
	return ( element > this.left ) && ( element < this.right );
    }

    toString() {
	return `(${this.left.toString()},${this.right.toString()})`;
    }
}

/** **************************************************************/
class ClosedInterval extends Interval {
    constructor( left, right ) {
	super( left, right );
	return new Union( [new OpenInterval( left, right ),
			   new Singleton( left ),
			   new Singleton( right )] );
    }
}

/** **************************************************************/
class OpenClosedInterval extends Interval {
    constructor( left, right ) {
	super( left, right );
	return new Union( [new OpenInterval( left, right ), new Singleton( right )] );
    }
}

/** **************************************************************/
class ClosedOpenInterval extends Interval {
    constructor( left, right ) {
	super( left, right );
	return new Union( [new OpenInterval( left, right ), new Singleton( left )] );
    }
}

/** **************************************************************/
const theModule = {
    Subset,
    EmptySet,
    RealLine,
    Singleton,
    Union,
    Interval,
    OpenInterval,
    ClosedInterval,
    OpenClosedInterval,
    ClosedOpenInterval,
};

/** **************************************************************/
export default theModule;
