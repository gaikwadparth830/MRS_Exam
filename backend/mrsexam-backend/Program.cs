using Microsoft.EntityFrameworkCore;
using mrsexam_backend;
using mrsexam_backend.Middleware;
using mrsexam_backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

builder.Services.Configure<BalbodhiniOptions>(builder.Configuration.GetSection(BalbodhiniOptions.SectionName));
builder.Services.Configure<PrathamikOptions>(builder.Configuration.GetSection(PrathamikOptions.SectionName));
builder.Services.Configure<PraveshikaOptions>(builder.Configuration.GetSection(PraveshikaOptions.SectionName));
builder.Services.Configure<SubodhOptions>(builder.Configuration.GetSection(SubodhOptions.SectionName));
builder.Services.Configure<PrabodhOptions>(builder.Configuration.GetSection(PrabodhOptions.SectionName));
builder.Services.Configure<PraveenOptions>(builder.Configuration.GetSection(PraveenOptions.SectionName));
builder.Services.Configure<PanditOptions>(builder.Configuration.GetSection(PanditOptions.SectionName));
builder.Services.Configure<SambhashanOptions>(builder.Configuration.GetSection(SambhashanOptions.SectionName));
builder.Services.AddScoped<PermissionService>();
builder.Services.AddScoped<UserAdminService>();
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
builder.Services.AddScoped<SubodhCandidateService>();
builder.Services.AddScoped<SubodhRollNumberService>();
builder.Services.AddScoped<SubodhMarksService>();
builder.Services.AddScoped<SubodhResultService>();
builder.Services.AddScoped<SubodhReportService>();
builder.Services.AddScoped<PrabodhCandidateService>();
builder.Services.AddScoped<PrabodhRollNumberService>();
builder.Services.AddScoped<PrabodhMarksService>();
builder.Services.AddScoped<PrabodhResultService>();
builder.Services.AddScoped<PrabodhReportService>();
builder.Services.AddScoped<PraveenCandidateService>();
builder.Services.AddScoped<PraveenRollNumberService>();
builder.Services.AddScoped<PraveenMarksService>();
builder.Services.AddScoped<PraveenResultService>();
builder.Services.AddScoped<PraveenReportService>();
builder.Services.AddScoped<PanditCandidateService>();
builder.Services.AddScoped<PanditRollNumberService>();
builder.Services.AddScoped<PanditMarksService>();
builder.Services.AddScoped<PanditResultService>();
builder.Services.AddScoped<PanditCrossRefService>();
builder.Services.AddScoped<PanditReportService>();
builder.Services.AddScoped<SambhashanCandidateService>();
builder.Services.AddScoped<SambhashanRollNumberService>();
builder.Services.AddScoped<SambhashanMarksService>();
builder.Services.AddScoped<SambhashanResultService>();
builder.Services.AddScoped<SambhashanReportService>();
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

app.UseMiddleware<CurrentUserMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();
