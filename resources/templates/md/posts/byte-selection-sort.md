{:title "61 byte selection sort"
 :date "2010-01-13"
 :layout post
 :tags ["programming" "C"]}


Here's the absolutely smallest array sorting function in C.
It's written by <a href="http://www.cs.dartmouth.edu/~doug/">M. Doughlas McIlroy</a> of Darthmouth College, NH USA.
It only 67 bytes long (ignoring new-line characters), which is ridiculously impressive.
In the function `s` shown below, `a` is the starting address of the array, and `b` is the address of the last element plus one.

```c
s(int*a,int*b)
{for(int*c=b,t;c>a;)if(t=*c--,*c>t)c[1]=*c,*c=t,c=b;}
```

This can be made even smaller using recursion and by inferring the type specifiers of global object declarations, which is a GCC hack.
In the following function, `n` is the number of elements in the array `a`.

```c
s(a,n)int*a;
{n-->1?s(a,n),s(a+1,n),n=*a,*a=a[1],a[n>*a]=n:0;}
```

The sorting function `s` is now only 61 bytes long!
