---
layout: post
title: "Abstract and parameterized types"
description: ""
category: programming 
tags: [scala]
---
{% include JB/setup %}

Scala supports both abstract and parameterized types, which are essentially revamped generics (in Java) or templates (in C++).

First off, methods can be parameterized, in order to abstract a generic type which can be used by it.
The `apply` method in companion objects is the best place to start. 
Here's an example from the implementation of the `List` class in the Scala library.

<script src="https://gist.github.com/4354753.js?file=List.scala"><!-- Gist  --></script>

Classes and traits can be parameterized as well.

In most languages, types are designed to reduce casting, which can be an expensive operation. 
Type systems also imply support for variance, i.e. *covariance* and *contravariance*. 

However, consider the use of a parameterized type in a trait. 
You *must* specify the parameterized type(s) in the deriving class, i.e. the deriving class *has* to be concrete. 

<script src="https://gist.github.com/4354753.js?file=SimpleJsonComment.scala"><!-- Gist  --></script>

`JsonComment` has to define the type `Comment` (Ok, I admit this is a really bad example), and it cannot omit the type.
Also, it's not possible to have members which are objects of the specified type.

Enter abstract types. Abstract types are types whose identity is not precisely known. 
Deriving classes *may* specify the abstract type(s) in a base class.
As parameterized types have variance annotations, abstract types have *type bounds*.

<script src="https://gist.github.com/4354753.js?file=AbstractedJsonComment.scala"><!-- Gist  --></script>

Here, `AbstractJsonComment` omits specifying the type `F` which has to be a subclass of `DateFormat`.
The class `AbstractFormattedJsonComment` specifies `F`, but has to be abstract as it doesn't implement the functions in `FromJson`.
Thus, these two classes specify the abstract types separately, and `JsonComment` specifies the implementation.
Note that `FromJson` has a member of type `F`, which it uses to provide a partial implementation.

Almost any implementation with parameterized types can be turned into one with abstract types, and vice versa. However, abstract types make it easier to separate implementation and specification.

