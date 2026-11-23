using Microsoft.EntityFrameworkCore;
using mrsexam_backend;
using mrsexam_backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<BalbodhiniOptions>(builder.Configuration.GetSection(BalbodhiniOptions.SectionName));
builder.Services.Configure<PrathamikOptions>(builder.Configuration.GetSection(PrathamikOptions.SectionName));
builder.Services.Configure<PraveshikaOptions>(builder.Configuration.GetSection(PraveshikaOptions.SectionName));
builder.Services.AddScoped<SessionService>();
builder.Services.AddScoped<CentreResolver>();
builder.Services.AddScoped<CandidateService>();
builder.Services.AddScoped<PrathamikCandidateService>();
builder.Services.AddScoped<RollNumberService>();
builder.Services.AddScoped<PrathamikRollNumberService>();
builder.Services.AddScoped<MarksService>();
builder.Services.AddScoped<PrathamikMarksService>();
builder.Services.AddScoped<ResultService>();
builder.Services.AddScoped<PrathamikResultService>();
builder.Services.AddScoped<ReportService>();
builder.Services.AddScoped<PrathamikReportService>();
builder.Services.AddScoped<PraveshikaCandidateService>();
builder.Services.AddScoped<PraveshikaRollNumberService>();
builder.Services.AddScoped<PraveshikaMarksService>();
builder.Services.AddScoped<PraveshikaResultService>();
builder.Services.AddScoped<PraveshikaReportService>();
builder.Services.AddScoped<DistrictUnicodeMigrationService>();
builder.Services.AddScoped<CentreUnicodeMigrationService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddDbContext<MrsexamContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure()));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
