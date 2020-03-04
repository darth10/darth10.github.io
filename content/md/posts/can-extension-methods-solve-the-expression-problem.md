{:title "Can extension methods solve the expression problem?"
 :date "2020-03-06"
 :layout :post
 :tags ["Solving the expression problem"]}

TODO intro and previous post

[Extension methods](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods)
in C# can be used to defines operation over a given type without modifying the
definition of the type. Let's try to use extension methods over interfaces to
implement a solution to the expression problem. First, we define `IExp`
as a marker interface and implement it in the `Const` and `Add` types.

TODO code

### References
1. <a id="ref1"
   href="http://homepages.inf.ed.ac.uk/wadler/papers/expression/expression.txt"
   target="_blank">
   The Expression Problem</a>.
2. TODO
